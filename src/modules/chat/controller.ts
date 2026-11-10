import type { Response, Request } from "express"
import { ChatService } from "./service"
import { PortfolioService, } from "../portfolio/service"
import { buildPortfolioContext, portfolioSystemPropmt } from "./ai/portfolio.context"
import { GeminiProvider } from "./ai/genai.provider"

/**
 * POST request
 * Body Parameters: 
 * {
        "portfolio_id": "xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "candidate_id": "xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "message": "What technologies do you have experience with?"
    }
 * Response:
 * {
    "success": true,
        "data": {
            "session_id": "...",
            "message": {
                "message_id": "...",
                "role": "assistant",
                "content": "..."
            }
        }
    }
 */
export const NewChatController = async (request: Request, response: Response) => {
    const requestBody = request.body

    try {
        // 1. Verify portfolio exists / is active
        const existingPortfolio = await PortfolioService.getById(requestBody.candidate_id, requestBody.portfolio_id)
        if (!existingPortfolio || !existingPortfolio?.is_active)
            return response.status(404).json({
                success: false,
                message: 'Portfolio not found!'
            })

        // 2. Create ChatSession & ChatMessage
        const userChat = await ChatService.createMessage(request.body)

        // 3. Build portfolio context
        const portfolioContext = await buildPortfolioContext(requestBody.candidate_id, requestBody.portfolio_id)

        // 4. Send message & portfolio context to AI
        const aiProvider = new GeminiProvider()
        const aiResponse = await aiProvider.generateResponse(portfolioSystemPropmt, portfolioContext, requestBody.message)

        // 5. Save AI response as another ChatMessage with existing session-id
        const aiChat = await ChatService.createMessage({
            portfolio_id: requestBody.portfolio_id,
            message: aiResponse,
            role: 'assistant',
            session_id: userChat.session_id ?? null
        })
        // 6. Return response + session_id
        return response.status(200).json({
            success: true,
            data: {
                session_id: userChat.session_id,
                message: aiChat
            }
        })
    } catch (error) {
        console.error("Chat request failed:", error);
        const statusCode = (error as Error & { statusCode?: number }).statusCode;

        if (statusCode === 502) {
            return response.status(502).json({
                success: false,
                code: "AI_PROVIDER_ERROR",
                message: "Sorry, I couldn't generate a response right now. Please try again."
            });
        }

        return response.status(500).json({
            success: false,
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal server error"
        })
    }
}


/**
 * GET request
 * Body Parameters: 
 * {
 *  "portfolio_id": "xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
 * }
 * Response:
 * {
 *  "success": true,
 *  "message": [
 *          {
 *              message_id: "xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
 *              session_id: "xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
 *              message: "lorem impsum....",
 *              role: "user"
 *          },
 *          {
 *              message_id: "xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
 *              session_id: "xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
 *              message: "lorem impsum....",
 *              role: "system"
 *          }
 *      ],
 *   "total": 100,
 *   "records_per_page": 10,
 *   "page": 1
 *  }
 */
export const FetchUserChatController = async (request: Request, response: Response) => {
    // 1. read the inputs from request body.
    const requestBody = request.params
    try{
        // 2. pass the params to the fetch service
        const res = await ChatService.fetchAllChat(requestBody)
        return response.status(200).json({
            success: true,
            data: res,
            message: "Records fetched successfully!"
        })
    }catch(err){
        return response.status(500).json({
            success: false,
            message: "Internal server error!"
        })
    }
}


/**
 * POST request
 * Body Parameters: 
 * {
 *  "session_id": "xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
 * }
 * Response:
 * {
 *  "success": true,
 *  "message": "I have experience with React, Node.js, Python and AWS..."
 *  }
 */
export const DeleteChatBySessionController = async (request: Request, response: Response) => {
    const requestParam = request.params
    console.log(requestParam,"=============requestParam")

    try{
        const resp = await ChatService.deleteBySessionId(requestParam)
        return response.status(204).json({
            success: true,
            message: 'Record deleted!'
        })
    }catch(err){
        return response.status(500).json({
            success: false,
            message: 'Internal server error!'
        })
    }
}
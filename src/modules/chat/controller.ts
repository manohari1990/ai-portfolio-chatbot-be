import type { Response, Request } from "express"
import { ChatService } from "./service"
import { PortfolioService } from "../portfolio/service"
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
 *  "portfolio_id": "portfolio-uuid",
 *  "message": "What technologies do you have experience with?"
 * }
 * Response:
 * {
 *  "success": true,
 *  "message": "I have experience with React, Node.js, Python and AWS..."
 *  }
 */
export const FetchChatController = (request: Request, response: Response) => {
    console.log(request)
}


/**
 * POST request
 * Body Parameters: 
 * {
 *  "portfolio_id": "portfolio-uuid",
 *  "message": "What technologies do you have experience with?"
 * }
 * Response:
 * {
 *  "success": true,
 *  "message": "I have experience with React, Node.js, Python and AWS..."
 *  }
 */
export const DeleteChatController = (request: Request, response: Response) => {
    console.log(request)
}
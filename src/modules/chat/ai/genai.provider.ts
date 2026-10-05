import 'dotenv/config';
import { GoogleGenAI } from '@google/genai'
import type { AIProvider } from './provider';

const apikey = process.env['GOOGLE_GENAI_API_KEY'] ?? ''

const aiclient = new GoogleGenAI({
    apiKey: apikey
})

export class GeminiProvider implements AIProvider {
    async generateResponse(systemPrompt: string, context: string, userMessage: string): Promise<string> {
        const actualContext = `
PORTFOLIO CONTEXT:
${context}

USER QUESTION:
${userMessage}
`
        let lastError: unknown;
        for(let attempt = 1; attempt <=2; attempt++){
            try{
                const response = await aiclient.models.generateContent({
                    model: "gemini-3.6-flash",
                    contents: actualContext,
                    config:{
                        systemInstruction: systemPrompt
                    }
                });
                return response.text ?? ""
            }catch(err){
                lastError = err;
                console.error(`Gemini request failed. Attempt ${attempt}/2`, err)
                if(attempt == 2 || err.status == 429){
                    console.log(err.status,"===================err.status")
                    break;
                }
                await new Promise(resolve=> setTimeout(resolve, 1000))
            }
        }
        const error = new Error("Google GenAI failed to respond after retry.");
        (error as Error & { statusCode?: number }).statusCode = 502;
        // Preserve the original error for server-side logging
        (error as Error & { cause?: unknown }).cause = lastError;
        throw error;

    }
} 
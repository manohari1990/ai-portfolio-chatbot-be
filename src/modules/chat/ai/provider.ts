export interface AIProvider{
    generateResponse(
        systemPrompt: string,
        context: string,
        userMessage: string
    ): Promise<string>
}

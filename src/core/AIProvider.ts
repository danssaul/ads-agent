export interface AIProvider{
    generateChatCompletion(prompt: string): Promise<string>;
    generateImage(prompt: string): Promise<string>;
}
import OpenAI from "openai";
import { AppError } from "../utils/AppError";
import { AdPromptData } from "../core/AdPromptData";

export class OpenAIProvider {
  private readonly openai: OpenAI;

  constructor(private readonly logger: any) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      this.logger.error('OPENAI_API_KEY is not set in environment variables.');
      throw new AppError("OPENAI_API_KEY is not set in environment variables.", 500, true);
    }

    this.openai = new OpenAI({ apiKey });
    this.logger.info('OpenAIProvider initialized.');
  }

  async generateChatCompletion(prompt: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });
      this.logger.info('Chat completion generated successfully.');
      return response.choices[0].message.content || "";
    } catch (error) {
      this.logger.error(`Error generating chat completion: ${error}`);
      throw error;
    }
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt,
        size: "1024x1024",
        quality: "standard",
        n: 1,
      });
      this.logger.info('Image generated successfully.');
      return response.data?.[0]?.url ?? "";
    } catch (error) {
      this.logger.error(`Error generating image: ${error}`);
      throw error;
    }
  }

  private async fallbackWithSearch(prompt: string): Promise<AdPromptData> {
    const fallbackPrompt = `
Você é um assistente de marketing com acesso a informações contextuais. Com base na seguinte solicitação:

"${prompt}"

Gere um JSON com as seguintes informações estimadas, completando o que faltar:

{
  "productName": string,
  "targetAudience": string,
  "keyBenefits": string[],
  "tone": string,
  "callToAction": string
}

Use termos realistas. Não use placeholders como "produto" ou campos vazios. Retorne **apenas um JSON puro e válido**, sem explicações, comentários ou marcações extras.`;

    const chatResponse = await this.generateChatCompletion(fallbackPrompt);

    try {
      const parsed: AdPromptData = JSON.parse(chatResponse);
      this.logger.info("Fallback successful.");
      return parsed;
    } catch (err) {
      this.logger.error(`Fallback parsing failed. Raw response: ${chatResponse}`);
      throw new AppError("Both primary and fallback prompt parsing failed", 500);
    }
  }

}

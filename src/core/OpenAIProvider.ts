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

  async generateStructuredAdData(userPrompt: string): Promise<AdPromptData> {
        const response = await this.openai.chat.completions.create({
            model: "gpt-4-0613",
            messages: [{
                role: "user",
                content: `Analyze the following ad request and extract structured data: "${userPrompt}"`,
            }],
            tools: [{
                type: "function",
                function: {
                    name: "extractAdPromptData",
                    description: "Extracts structured ad information from a user request",
                    parameters: {
                        type: "object",
                        properties: {
                            productName: { type: "string" },
                            targetAudience: { type: "string" },
                            keyBenefits: {
                                type: "array",
                                items: { type: "string" }
                            },
                            tone: { type: "string" },
                            callToAction: { type: "string" }
                        },
                        required: ["productName", "targetAudience", "keyBenefits", "tone", "callToAction"]
                    }
                }
            }],
            tool_choice: "auto"
        });

        const toolCall = response.choices[0]?.message?.tool_calls?.[0];
        if (!toolCall || toolCall.function.name !== "extractAdPromptData") {
            throw new AppError("Function call failed or returned invalid function");
        }

        return JSON.parse(toolCall.function.arguments) as AdPromptData;
    }

}

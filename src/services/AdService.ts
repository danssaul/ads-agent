import { OpenAIProvider } from "../core/OpenAIProvider";
import { PromptBuilder } from "../core/PromptBuilder";
import { AppError } from "../utils/AppError";
import { AdPromptData } from "../core/AdPromptData";

export class AdService {
    constructor(
        private readonly openai: OpenAIProvider,
        private readonly logger: any
    ) { }

    async generateAd(rawPrompt: string) {
        this.logger.info('Starting ad generation process.');
        const analysisPrompt = PromptBuilder.buildPromptAnalysis(rawPrompt);
        this.logger.debug(`Analysis prompt: ${analysisPrompt}`);
        const analysisResponse = await this.openai.generateChatCompletion(analysisPrompt);

        let structuredData;
        try {
            structuredData = JSON.parse(analysisResponse);
            this.logger.debug('Structured data parsed successfully.');
        } catch (e) {
            this.logger.error(`Failed to parse structured prompt data: ${analysisResponse}`);
            throw new AppError("Could not parse structured prompt data: " + analysisResponse, 400);
        }
        if (this.isWeakContent(structuredData)) {
            this.logger.warn("Structured data is weak or incomplete. Attempting fallback...");
            structuredData = await this.fallbackWithSearch(rawPrompt);
        }

        const textPrompt = PromptBuilder.buildTextPromptFromStructured(structuredData);
        this.logger.debug(`Text prompt: ${textPrompt}`);
        const adText = await this.openai.generateChatCompletion(textPrompt);

        const imagePrompt = PromptBuilder.buildImagePromptFromStructured({
            productName: structuredData.productName,
            keyBenefits: structuredData.keyBenefits,
        });
        this.logger.debug(`Image prompt: ${imagePrompt}`);
        const imageUrl = await this.openai.generateImage(imagePrompt);

        this.logger.info('Ad generation completed.');
        return {
            ad: {
                text: adText,
                imageUrl: imageUrl,
            },
        };
    }

    private isWeakContent(data: AdPromptData): boolean {
        const isEmpty = (value: string | string[]) => {
            if (Array.isArray(value)) return value.length === 0 || value.every(v => !v.trim());
            return !value.trim() || value.trim().length < 3;
        };

        return (
            isEmpty(data.productName) ||
            isEmpty(data.targetAudience) ||
            isEmpty(data.keyBenefits) ||
            isEmpty(data.tone) ||
            isEmpty(data.callToAction) ||
            /\n{2,}/.test(data.callToAction) ||
            /\n{2,}/.test(data.productName)
        );
    }

    private async fallbackWithSearch(prompt: string): Promise<AdPromptData> {
        const fallbackPrompt = PromptBuilder.buildFallbackPrompt(prompt);
        const chatResponse = await this.openai.generateChatCompletion(fallbackPrompt);

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

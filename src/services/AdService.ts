import { OpenAIProvider } from "../core/OpenAIProvider";
import { PromptBuilder } from "../core/PromptBuilder";
import { AppError } from "../utils/AppError";
import { AdPromptData } from "../core/AdPromptData";

export class AdService {
    constructor(
        private readonly provider: OpenAIProvider,
        private readonly logger: any
    ) { }

async generateAd(rawPrompt: string) {
    this.logger.info('Starting ad generation process.');
    let structuredData: AdPromptData;

    try {
        structuredData = await this.provider.generateStructuredAdData(rawPrompt);
        this.logger.debug('Structured data extracted via function calling.');
    } catch (err) {
        this.logger.error('Function calling failed. Falling back to legacy prompt analysis.', err);
        const analysisPrompt = PromptBuilder.buildPromptAnalysis(rawPrompt);
        const analysisResponse = await this.provider.generateChatCompletion(analysisPrompt);

        try {
            structuredData = JSON.parse(analysisResponse);
            this.logger.debug('Parsed structured data from legacy prompt.');
        } catch (e) {
            this.logger.error(`Failed to parse legacy structured data: ${analysisResponse}`);
            this.logger.warn('Attempting fallbackWithSearch with estimated completion…');

            const fallbackPrompt = PromptBuilder.buildFallbackPrompt(rawPrompt);
            const fallbackResponse = await this.provider.generateChatCompletion(fallbackPrompt);

            try {
                structuredData = JSON.parse(fallbackResponse);
                this.logger.debug('Parsed structured data from fallback estimation.');
            } catch (e2) {
                this.logger.error(`Final fallback also failed: ${fallbackResponse}`);
                throw new AppError("Ad structure parsing failed from all methods.", 400);
            }
        }
    }

    const textPrompt = PromptBuilder.buildTextPromptFromStructured(structuredData);
    const adText = await this.provider.generateChatCompletion(textPrompt);

    const imagePrompt = PromptBuilder.buildImagePromptFromStructured({
        productName: structuredData.productName,
        keyBenefits: structuredData.keyBenefits,
    });
    const imageUrl = await this.provider.generateImage(imagePrompt);

    this.logger.info('Ad generation completed.');
    return {
        ad: {
            text: adText,
            imageUrl: imageUrl,
        },
    };
}

}

import { AdPromptData } from "./AdPromptData";

export class PromptBuilder {
    static buildPromptAnalysis(userPrompt: string): string {
        return `
"${userPrompt}"

You are a marketing assistant with access to contextual information. Based on the request above:

Generate a JSON with the following estimated information, completing any missing parts:

{
  "productName": string,
  "targetAudience": string,
  "keyBenefits": string[],
  "tone": string,
  "callToAction": string
}

Use realistic terms. Do not use placeholders like "product" or leave fields empty. Return **only a valid pure JSON**, with no explanations, comments, or extra markings.
`.trim();
    }


    static buildTextPromptFromStructured(data: AdPromptData): string {
        return `
You are a professional Facebook ads copywriter.

Create a compelling, short Facebook ad using the following data:
- Product: ${data.productName}
- Audience: ${data.targetAudience}
- Benefits: ${data.keyBenefits.join(", ")}
- Tone: ${data.tone}
- CTA: ${data.callToAction}

Keep it around 3 short sentences and start with an attention-grabbing phrase or emoji if appropriate.`;
    }

    static buildImagePromptFromStructured(data: Pick<AdPromptData, 'productName' | 'keyBenefits'>): string {
        return `
Create a high-quality product photo for a Facebook ad.

Subject: ${data.productName}
Key attributes: ${data.keyBenefits.join(", ")}

Style:
- Photorealistic, shallow depth of field
- Natural or studio lighting
- Clean, white or soft neutral background
- No people, hands, logos, or text in the image

The image should focus on the product and be visually suitable for use in Facebook Ads.`;
    }

    static buildFallbackPrompt(userPrompt: string): string {
        return [
            'Você é um assistente de marketing com acesso a informações contextuais. Com base na seguinte solicitação:',
            '',
            '"' + userPrompt + '"',
            '',
            'Gere um JSON com as seguintes informações estimadas, completando o que faltar:',
            '',
            '{',
            '  "productName": string,',
            '  "targetAudience": string,',
            '  "keyBenefits": string[],',
            '  "tone": string,',
            '  "callToAction": string',
            '}',
            '',
            'Use termos realistas. Não use placeholders como "produto" ou campos vazios. Retorne **apenas um JSON puro e válido**, sem explicações, comentários ou marcações extras.'
        ].join('\n');
    }
}

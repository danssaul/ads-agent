import { AdPromptData } from "./AdPromptData";

export class PromptBuilder {

    private static rolePrompt = `
You are a marketing assistant AI specialized in extracting structured ad data from natural language prompts.`;

    private static examplePrompt = `
Example:
User request: "quero um anúncio para um aplicativo de finanças pessoais"

Expected JSON:
{
  "productName": "Aplicativo de Finanças Pessoais",
  "targetAudience": "Adultos que querem economizar dinheiro",
  "keyBenefits": ["Organize gastos", "Defina metas", "Acompanhe despesas em tempo real"],
  "tone": "Confiável e encorajador",
  "callToAction": "Baixe agora o app e assuma o controle da sua vida financeira"
}`;

    private static instructionPrompt = `
Return only a valid pure JSON in the format:

{
  "productName": string,
  "targetAudience": string,
  "keyBenefits": string[],
  "tone": string,
  "callToAction": string
}

- Do not leave fields blank
- Do not use placeholders like "produto"
- Respond with **only the JSON**
- No extra text, explanation, or formatting`;

    static buildPromptAnalysis(userPrompt: string): string {
        return [
            this.rolePrompt,
            `User request:\n"${userPrompt}"`,
            this.examplePrompt,
            this.instructionPrompt,
        ].join("\n\n").trim();
    }

    static buildTextPromptFromStructured(data: AdPromptData): string {
        const role = `You are a professional Facebook ads copywriter.`;
        const instructions = `
Create a compelling, short Facebook ad using the following data:
- Product: ${data.productName}
- Audience: ${data.targetAudience}
- Benefits: ${data.keyBenefits.join(", ")}
- Tone: ${data.tone}
- CTA: ${data.callToAction}

Keep it around 3 short sentences and start with an attention-grabbing phrase or emoji if appropriate.`;

        return [role, instructions].join("\n\n").trim();
    }

    static buildImagePromptFromStructured(data: Pick<AdPromptData, 'productName' | 'keyBenefits'>): string {
        const role = `Create a high-quality product photo for a Facebook ad.`;
        const subject = `
Subject: ${data.productName}
Key attributes: ${data.keyBenefits.join(", ")}`;
        const style = `
Style:
- Photorealistic, shallow depth of field
- Natural or studio lighting
- Clean, white or soft neutral background
- No people, hands, logos, or text in the image

The image should focus on the product and be visually suitable for use in Facebook Ads.`;

        return [role, subject, style].join("\n\n").trim();
    }

    static buildFallbackPrompt(userPrompt: string): string {
        const fallbackInstructions = `Gere um JSON com as seguintes informações estimadas, completando o que faltar:`;
        const format = `{
  "productName": string,
  "targetAudience": string,
  "keyBenefits": string[],
  "tone": string,
  "callToAction": string
}`;
        const constraints = `
Use termos realistas. Não use placeholders como "produto" ou campos vazios. Retorne **apenas um JSON puro e válido**, sem explicações, comentários ou marcações extras.`;

        return [
            this.rolePrompt,
            `Solicitação do usuário:\n"${userPrompt}"`,
            fallbackInstructions,
            format,
            constraints
        ].join("\n\n").trim();
    }
}

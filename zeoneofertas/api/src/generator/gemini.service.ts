import { Injectable } from '@nestjs/common';

export interface GenerateCopyDto {
  productName: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  coupon?: string;
  affiliateLink?: string;
  tone?: string;
  network?: string;
}

@Injectable()
export class GeminiService {
  async generateCopy(dto: GenerateCopyDto): Promise<{ copy: string; aiPowered: boolean }> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const prompt = `Você é um especialista em Copywriting de Vendas e Marketing de Afiliados de alta conversão para WhatsApp e Instagram.
Crie um texto persuasivo para divulgar a seguinte oferta:
- Produto: ${dto.productName}
- Preço Atual: ${dto.price}
${dto.originalPrice ? `- Preço Anterior: ${dto.originalPrice}` : ''}
${dto.discount ? `- Desconto: ${dto.discount}` : ''}
${dto.coupon ? `- Cupom de Desconto: ${dto.coupon}` : ''}
- Link para Compra: ${dto.affiliateLink || '[Cole o Link]'}
- Tom de voz: ${dto.tone || 'Urgente'}
- Rede Social alvo: ${dto.network || 'WhatsApp'}

Instruções:
- Use emojis chamativos de forma estratégica.
- Crie uma chamada de impacto.
- Destaque a economia e o cupom de desconto se houver.
- Mantenha a leitura dinâmica e fácil de compartilhar.`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return { copy: text.trim(), aiPowered: true };
          }
        }
      } catch (err) {
        console.warn('Erro ao consultar Gemini API, utilizando motor inteligente fallback.', err);
      }
    }

    // AI Persuasive Fallback Motor
    let copy = `🔥 OPORTUNIDADE IMPERDÍVEL ENCONTRADA!\n\n`;
    copy += `📦 ${dto.productName}\n\n`;
    if (dto.originalPrice) copy += `De: ${dto.originalPrice}\n`;
    copy += `Por apenas: ${dto.price} ${dto.discount ? `(${dto.discount})` : ''}\n\n`;
    if (dto.coupon) copy += `🎟️ Cupom Extra: ${dto.coupon}\n`;
    copy += `📦 Frete Grátis disponível!\n\n`;
    copy += `👉 Garanta a sua oferta no link: ${dto.affiliateLink || 'https://mercadolivre.com/sec/2oK8aX9'}\n\n`;
    copy += `⚠️ Preço e disponibilidade válidos por tempo limitado.`;

    return { copy, aiPowered: false };
  }
}

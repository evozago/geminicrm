import { GoogleGenAI } from "@google/genai";
import { RankingCliente, SalesSniperMatch } from '../types';

// NOTE: In production, never expose API keys on the client side without proper restrictions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Model Constants
const MODEL_FAST = 'gemini-2.5-flash-lite-latest';
const MODEL_THINKING = 'gemini-3-pro-preview';

export const generateRecoveryMessage = async (cliente: RankingCliente): Promise<string> => {
  try {
    const prompt = `
      Você é um assistente de vendas de uma loja de roupas chamada 'ModaInteligente'.
      Crie uma mensagem de WhatsApp curta, amigável e personalizada para a cliente ${cliente.cliente_nome}.
      Ela não compra há ${cliente.dias_sem_comprar} dias.
      O tom deve ser de "Saudades", sem parecer desesperado por vendas.
      Ofereça ajuda para ver a nova coleção.
      Use emojis.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
    });

    return response.text || "Olá! Estamos com saudades. Venha conferir as novidades!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return `Olá ${cliente.cliente_nome}, tudo bem? Faz tempo que não te vemos! Chegaram novidades lindas, vamos dar uma olhada?`;
  }
};

export const generateSniperPitch = async (match: SalesSniperMatch, produtoNovo: string): Promise<string> => {
  try {
    const prompt = `
      Crie uma mensagem curta de venda para WhatsApp para a cliente ${match.cliente.nome}.
      Estamos oferecendo o novo produto: "${produtoNovo}".
      Motivo da recomendação: ${match.motivo}.
      A mensagem deve ser empolgante e mencionar que lembramos dela por causa das compras anteriores.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
    });

    return response.text || `Olá ${match.cliente.nome}, lembramos de você! Chegou ${produtoNovo} que é a sua cara!`;
  } catch (error) {
    console.error("Gemini Error:", error);
    return `Oi ${match.cliente.nome}! Chegou ${produtoNovo} e lembrei de você!`;
  }
};

export const analyzeTrends = async (data: any): Promise<string> => {
  try {
    const prompt = `
      Analise os seguintes dados de vendas mensais (JSON):
      ${JSON.stringify(data)}
      
      Identifique padrões, sazonalidade ou riscos.
      Forneça 3 insights estratégicos curtos para o dono da loja aumentar o lucro.
      Responda em Português do Brasil.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_THINKING,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 2048 }, // Using thinking budget for deeper analysis
      }
    });

    return response.text || "Não foi possível analisar os dados no momento.";
  } catch (error) {
    console.error("Gemini Thinking Error:", error);
    return "Erro ao analisar tendências. Verifique a chave de API.";
  }
};

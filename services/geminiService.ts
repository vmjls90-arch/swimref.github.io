
import { GoogleGenAI } from "@google/genai";
import { Competition, User } from '../types';

export const generateCompetitionBriefing = async (competition: Competition, attendees: User[]): Promise<string> => {
  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    return "Erro: API_KEY não configurada. Por favor, adicione a chave nas variáveis de ambiente da Vercel.";
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const attendeeNames = attendees.length > 0 ? attendees.map(u => u.name).join(', ') : 'Nenhum árbitro confirmado ainda';
  
  const prompt = `
    Aja como um diretor de prova de natação experiente e profissional. A sua tarefa é gerar um texto de briefing detalhado para os árbitros de uma competição.
    O texto deve ser claro, conciso, bem estruturado e utilizar o formato Markdown.
    
    **Detalhes da Competição:**
    - **Nome:** ${competition.name}
    - **Data:** ${new Date(competition.date).toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
    - **Local:** ${competition.location}
    - **Descrição:** ${competition.description}
    - **Nível:** ${competition.level}
    - **Piscina:** ${competition.poolType}
    - **Responsável CRA:** ${competition.craResponsible || 'Não atribuído'}
    
    **Árbitros Confirmados:**
    - ${attendeeNames}
    
    **Estrutura do Briefing:**
    ### Briefing para a Competição: ${competition.name}
    ... (restante da estrutura)
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "Não foi possível gerar o briefing.";
  } catch (error) {
    console.error("Erro ao gerar briefing:", error);
    return "Ocorreu um erro ao comunicar com a IA.";
  }
};
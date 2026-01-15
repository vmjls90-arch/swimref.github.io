
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";
import { Competition, User } from '../types';

// Esta função será executada no ambiente de servidor da Vercel
export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }
  
  const { competition, attendees } = request.body as { competition: Competition, attendees: User[] };

  if (!competition || !attendees) {
    return response.status(400).json({ error: 'Dados da competição em falta no pedido.' });
  }

  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    console.error("API_KEY do Google GenAI não encontrada nas variáveis de ambiente do servidor.");
    return response.status(500).json({ error: "Configuração do servidor incompleta: API Key em falta." });
  }

  try {
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
      
      **Estrutura do Briefing (siga esta estrutura):**
      
      ### Briefing para a Competição: ${competition.name}
      
      **1. Boas-vindas e Introdução**
      - Cumprimente a equipa de arbitragem e agradeça a sua presença.
      - Apresente brevemente a importância e o nível da competição.
      - Mencione o Responsável do CRA presente: ${competition.craResponsible}.
      
      **2. Horários Importantes**
      - Reunião de árbitros (sugira uma hora, por exemplo, 45 minutos antes do início).
      - Início do aquecimento.
      - Início da sessão.
      - Pausas previstas (se aplicável).
      
      **3. Distribuição de Funções e Postos**
      - Sugira uma distribuição inicial de funções para os árbitros confirmados (Juiz de Partida, Juiz de Viragem, Cronometrista, etc.).
      - Se não houver árbitros confirmados, mencione que as funções serão distribuídas na reunião.
      - Reforce a importância da comunicação e da rotação de postos, se planeada.
      
      **4. Pontos de Foco e Regras Específicas**
      - Mencione quaisquer regras específicas ou pontos de atenção para esta competição (ex: partidas, viragens, desqualificações comuns).
      - Fale sobre o procedimento de partida e a importância da pontualidade.
      
      **5. Procedimentos e Logística**
      - Local da reunião de árbitros.
      - Informações sobre alimentação e hidratação.
      - Código de vestuário.
      
      **6. Observações Finais**
      - Deseje a todos uma excelente competição.
      - Incentive o trabalho em equipa e o profissionalismo.
      
      Por favor, gere o briefing completo com base nestas informações.
    `;

    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    const briefingText = geminiResponse.text;

    if (briefingText) {
      return response.status(200).json({ briefing: briefingText });
    } else {
      return response.status(500).json({ error: "A resposta da IA estava vazia." });
    }

  } catch (error) {
    console.error("Erro na Serverless Function ao chamar a Gemini API:", error);
    return response.status(500).json({ error: "Ocorreu um erro no servidor ao gerar o briefing." });
  }
}

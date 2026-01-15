
// A lógica deste ficheiro foi movida para uma Serverless Function em `api/generate-briefing.ts`.
// Chamar a API Gemini diretamente do lado do cliente exporia a API Key, o que é um risco de segurança.
// A Serverless Function executa no servidor da Vercel, onde a API Key pode ser acedida de forma segura através de variáveis de ambiente.
// O frontend agora faz uma chamada `fetch` para essa função.
// Este ficheiro pode ser removido com segurança.

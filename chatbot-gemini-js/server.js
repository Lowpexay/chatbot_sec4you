const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const dotenv = require("dotenv");

dotenv.config();

const API_KEY = process.env.API_KEY;
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-pro",
  temperature: 0,
  maxRetries: 2,
  apiKey: API_KEY,
});

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: "Mensagem vazia" });
  }

  try {
    const aiMsg = await llm.invoke([
      [
        "system",
        `Você é um assistente útil que responde em português brasileiro. 
        Analise o tom emocional da mensagem do usuário e inclua o tom no formato [TOM: feliz, bravo, triste, explicando, neutro].
        Depois, responda de forma clara e objetiva.`,
      ],
      ["human", userMessage],
    ]);

    const aiResponse = aiMsg.content || "Desculpe, não consegui gerar uma resposta.";
    const moodMatch = aiResponse.match(/\[TOM:\s*(feliz|bravo|triste|explicando|neutro)\]/i);
    const mood = moodMatch ? moodMatch[1].toLowerCase() : "neutro";
    const cleanResponse = aiResponse.replace(/\[TOM:\s*(feliz|bravo|triste|explicando|neutro)\]/i, "").trim();

    res.json({ response: cleanResponse, mood });
  } catch (error) {
    console.error("Erro ao se comunicar com a API do Gemini:", error.message || error);
    res.status(500).json({ error: "Erro ao se comunicar com a API do Gemini." });
  }
};
// Rota para servir imagens
app.use("/images", express.static(IMAGE_FOLDER));

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
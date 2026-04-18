import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

let conversationHistory = []; // stores all messages

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) return res.status(400).json({ error: "No message provided" });

    // Add user message to history
    conversationHistory.push({ role: "user", content: message });

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: conversationHistory,
      temperature: 0.7,
    });

    const aiMessage = response.choices[0].message.content;

    // Add AI message to history
    conversationHistory.push({ role: "assistant", content: aiMessage });

    res.json({ reply: aiMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI couldn't respond. Try again." });
  }
});

// Reset conversation (optional)
app.post("/reset", (req, res) => {
  conversationHistory = [];
  res.json({ status: "Conversation reset" });
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
import { Router } from "express";
import { ai, DEFAULT_MODEL } from "../utils/gemini.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { messages } = req.body; 
    // messages = [{ role: "user", content: "Hi" }, { role: "assistant", content: "Hello" }]

    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: "Messages required" });
    }

    // Gemini format convert
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Single response (non-streaming)
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents,
    });

    res.json({ reply: response.text });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || "Gemini API error" });
  }
});

export default router;

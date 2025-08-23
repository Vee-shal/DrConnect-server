var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from "express";
import { ai, DEFAULT_MODEL } from "../utils/gemini.js";
const router = Router();
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { messages } = req.body;
        // messages = [{ role: "user", content: "Hi" }, { role: "assistant", content: "Hello" }]
        if (!messages || messages.length === 0) {
            return res.status(400).json({ error: "Messages required" });
        }
        // Gemini format convert
        const contents = messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
        }));
        // Single response (non-streaming)
        const response = yield ai.models.generateContent({
            model: DEFAULT_MODEL,
            contents,
        });
        res.json({ reply: response.text });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || "Gemini API error" });
    }
}));
export default router;

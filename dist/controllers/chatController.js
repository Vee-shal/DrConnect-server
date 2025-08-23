var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import prisma from "../config/db.js";
// Create a new chat
export const createChat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const chat = yield prisma.chat.create({
            data: { userId },
        });
        res.status(201).json(chat);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to create chat", details: err });
    }
});
// Add message to chat
export const addMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId, senderId, content } = req.body;
        const message = yield prisma.message.create({
            data: {
                chatId,
                senderId,
                content,
            },
        });
        res.status(201).json(message);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to add message", details: err });
    }
});
// Get messages for a chat
export const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatId } = req.params;
        const messages = yield prisma.message.findMany({
            where: { chatId: Number(chatId) },
            orderBy: { createdAt: "asc" },
            include: { sender: { select: { id: true, name: true, role: true } } },
        });
        res.json(messages);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch messages", details: err });
    }
});

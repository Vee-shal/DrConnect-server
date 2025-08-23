import { Router } from "express";
import { createChat, addMessage, getMessages } from "../controllers/chatController.js";
const router = Router();
router.post("/create", createChat);
router.post("/message", addMessage);
router.get("/chat/:chatId/messages", getMessages);
export default router;

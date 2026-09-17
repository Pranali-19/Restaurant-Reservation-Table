import express from "express";
import {
    chatWithBot,
    resetChatSession
} from "../controllers/chatbotController.js";
import optionalAuthMiddleware from "../middleware/optionalAuthMiddleware.js";

const router = express.Router();

router.post("/message", optionalAuthMiddleware, chatWithBot);
router.post("/reset", resetChatSession);

export default router;
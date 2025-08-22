import express from "express";
import parser from "../middlewares/upload.js";
import { uploadProfileController } from "../controllers/uploadContoller.js";
const router = express.Router();
router.post("/profile", parser.single("profile"), uploadProfileController);
export default router;

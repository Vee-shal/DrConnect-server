import express from "express";
import { registerUser } from "../controllers/authControllers.js";
const router = express.Router();
//Sign Up route 
router.post("/register", registerUser);
export default router;

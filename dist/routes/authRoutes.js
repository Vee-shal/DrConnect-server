import express from "express";
import { registerUser, userLogin } from "../controllers/authControllers.js";
const router = express.Router();
//Sign Up route 
router.post("/register", registerUser);
router.post("/login", userLogin);
export default router;

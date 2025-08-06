import express from "express";
import { forgotPassword, registerUser, userLogin, verifyOTP } from "../controllers/authControllers.js";
const router = express.Router();
//Sign Up route 
router.post("/register", registerUser);
router.post("/login", userLogin);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
export default router;

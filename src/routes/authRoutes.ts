import express from "express"
import { forgotPassword, registerUser, resetPassword, userLogin, verifyOTP } from "../controllers/authControllers.js";


const router = express.Router();
//Sign Up route 
router.post("/register",registerUser)
router.post("/login",userLogin)
router.post("/forgot-password", forgotPassword )
router.post("/verify-otp",verifyOTP )
router.post("/reset-password",resetPassword )
export default router;
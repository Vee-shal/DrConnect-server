import express from "express"
import { registerUser } from "../controllers/authControllers";


const router = express.router();
//Sign Up route 
router.post("/register",registerUser)

export default router;
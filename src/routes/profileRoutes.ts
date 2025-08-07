import express from "express"
import { updateDoctor } from "../controllers/profileController.js";


const router = express.Router();
 
router.post("/update",updateDoctor)

export default router;
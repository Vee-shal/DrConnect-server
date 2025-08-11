import express from "express"
import { updateDoctor, updatePatient } from "../controllers/profileController.js";


const router = express.Router();
 
router.post("/update-doctor",updateDoctor)
router.post("/update-patient",updatePatient)

export default router;
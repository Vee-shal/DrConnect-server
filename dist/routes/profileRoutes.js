import express from "express";
import { updateDoctor, updatePatient } from "../controllers/profileController.js";
import upload from "../middlewares/upload.js";
const router = express.Router();
router.post("/update-doctor", upload.fields([{ name: "profilePhoto", maxCount: 1 }, { name: "certificate", maxCount: 1 }]), updateDoctor);
router.post("/update-patient", updatePatient);
export default router;

// routes/doctor.route.ts

import express from "express";
import { getVerifiedDoctorsWithProfile } from "../controllers/doctorController.js"; 

const router = express.Router();

router.get("/verified", getVerifiedDoctorsWithProfile);

export default router;

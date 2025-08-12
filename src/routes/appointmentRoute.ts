// routes/doctor.route.ts

import express from "express";
import { createAppointment } from "../controllers/appointmentController.js"; 

const router = express.Router();

router.post("/request", createAppointment);

export default router;

// routes/doctor.route.ts

import express from "express";
import { createAppointment,getAppointments } from "../controllers/appointmentController.js"; 

const router = express.Router();

router.post("/request", createAppointment);
router.get("/all", getAppointments);

export default router;

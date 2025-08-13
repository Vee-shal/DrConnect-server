// routes/doctor.route.ts
import express from "express";
import { createAppointment, getAppointments, updateAppointmentDetails, } from "../controllers/appointmentController.js";
const router = express.Router();
router.get("/all", getAppointments);
router.post("/request", createAppointment);
router.post("/update-appointment", updateAppointmentDetails);
export default router;

import { Router } from "express";
import { getAllUsers, deleteDoctor, verifyDoctor, deleteUser, getAllAppointments, addHospital, getAllHospitals } from "../controllers/AdminController.js";
const router = Router();
router.get("/get-users", getAllUsers);
router.delete("/delete-doctor/:id", deleteDoctor);
router.put("/verify-doctor/:id", verifyDoctor);
router.delete("/delete-user/:id", deleteUser);
router.get("/all-appointment", getAllAppointments);
// Admin routes
router.post("/add-hospital", addHospital);
router.get("/all-hospital", getAllHospitals);
export default router;

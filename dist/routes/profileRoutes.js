import express from "express";
import { updateUser } from "../controllers/profileController.js";
const router = express.Router();
router.post("/update", updateUser);
export default router;

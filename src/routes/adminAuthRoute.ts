import { Router } from "express";
import { adminLogin } from "../controllers/adminAuthController.js";
import { adminAuth } from "../middlewares/AdminAuth.js";

const router = Router();

// POST /api/admin/login
router.post("/admin-login", adminLogin);

router.get("/dashboard", adminAuth, (req, res) => {
  res.json({ message: "Welcome to Admin Dashboard", admin: req.user });
});


export default router;

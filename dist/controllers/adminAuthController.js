var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import prisma from "../config/db.js"; // Prisma client
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export const adminLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // 1. Find user with role "admin"
        const admin = yield prisma.user.findUnique({
            where: { email },
        });
        if (!admin || admin.role !== "admin") {
            return res.status(400).json({ message: "Admin not found" });
        }
        // 2. Compare password
        const isMatch = yield bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        // 3. Generate JWT
        const token = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        // 4. Return response
        return res.json({
            message: "Login successful",
            token,
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                phoneNumber: admin.phoneNumber,
                verified: admin.verified,
            },
        });
    }
    catch (error) {
        console.error("Admin login error:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

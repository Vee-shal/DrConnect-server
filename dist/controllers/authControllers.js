var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config(); // ✅ ensure this is initialized
export const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, role, phone_number, specialization, experience, license, certificate, } = req.body;
        // Basic validation
        if (!name || !email || !phone_number || !password || !role) {
            return res.status(400).json({ message: "Required Fields are missing!" });
        }
        // Check if user already exists
        const existingUser = yield prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(409).json({ message: "User Already Exists." });
        }
        // Hash password
        const hashedPassword = yield bcrypt.hash(password, 10);
        // Create user in DB
        const user = yield prisma.user.create({
            data: {
                name,
                email,
                phoneNumber: phone_number, // ✅ matches Prisma field
                password: hashedPassword,
                role,
                specialization: role === "doctor" ? specialization : null,
                experience: role === "doctor" ? experience : null,
                license: role === "doctor" ? license : null,
                certificateURL: role === "doctor" && certificate ? Buffer.from(certificate, "base64") : null, // ✅ for Bytes
            },
        });
        // Generate JWT token
        const token = jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role,
        }, process.env.JWT_SECRET, // ✅ Type assertion
        { expiresIn: "7d" } // ✅ correct key is `expiresIn`
        );
        // Response
        res.status(200).json({
            message: "User Registered Successfully!",
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                email: user.email,
                phone_number: user.phoneNumber,
                specialization: user.specialization,
                experience: user.experience,
                license: user.license,
                certificate: user.certificateURL
                    ? Buffer.from(user.certificateURL).toString("base64")
                    : null,
                token,
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
});

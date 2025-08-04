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
import { registerUserSchema, loginUserSchema } from "../validators/userSchemas.js";
dotenv.config();
export const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parseResult = registerUserSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: parseResult.error.issues,
            });
        }
        const { name, email, password, role, phone_number, specialization, experience, license, certificate, } = parseResult.data;
        // Check if user already exists
        const existingUser = yield prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists." });
        }
        // Hash password
        const hashedPassword = yield bcrypt.hash(password, 10);
        // Check role
        const isDoctor = role === "doctor";
        // Create user based on role
        const user = yield prisma.user.create({
            data: {
                name,
                email,
                phoneNumber: phone_number,
                password: hashedPassword,
                role,
                specialization: isDoctor ? specialization : null,
                experience: isDoctor ? experience : null,
                license: isDoctor ? license : null,
                certificateURL: isDoctor && certificate
                    ? Buffer.from(certificate, "base64")
                    : null,
            },
        });
        // Generate token
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
        return res.status(201).json({
            message: "User registered successfully",
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
            },
            token,
        });
    }
    catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({ message: "Server error" });
    }
});
export const userLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate input
        const parseResult = loginUserSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: parseResult.error.issues,
            });
        }
        const { email, password } = parseResult.data;
        // Find user
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({
                message: "User does not exist. Please register first.",
            });
        }
        // Compare passwords
        const isMatch = yield bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password." });
        }
        // Generate token
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
        return res.status(200).json({
            message: "Login successful",
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
            },
            token,
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: typeof error === "object" &&
                error !== null &&
                "message" in error
                ? error.message
                : String(error),
        });
    }
});

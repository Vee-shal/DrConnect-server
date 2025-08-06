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
import { registerUserSchema, loginUserSchema, } from "../validators/userSchemas.js";
import { createClient } from 'redis';
import nodemailer from "nodemailer";
// Redis Client Setup
const redisClient = createClient({
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379')
    }
});
redisClient.on('error', err => console.log('Redis Client Error', err));
redisClient.connect();
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
        const { name, email, password, role, phone_number, specialization, experience, license, verified } = parseResult.data;
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
                specialization: role === "doctor" ? specialization : null,
                experience: role === "doctor" ? experience : null,
                license: role === "doctor" ? license : null,
                verified,
                // certificateURL:
                //   role === "doctor" && certificate
                //     ? Buffer.from(certificate, "base64")
                //     : null,
            },
        });
        // Generate token
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
        return res.status(200).json({
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
                verified
            },
            token,
            status: 200,
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
                verified: user.verified,
                // certificate: user.certificateURL
                //   ? Buffer.from(user.certificateURL).toString("base64")
                //   : null,
            },
            token,
            status: 200,
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: typeof error === "object" && error !== null && "message" in error
                ? error.message
                : String(error),
        });
    }
});
;
export const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        // Check if user exists
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Generate OTP (6 digits)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Store OTP in Redis with 5-minute expiry
        yield redisClient.setEx(`password_reset:${email}`, 300, otp);
        // Setup nodemailer transporter (Gmail example)
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_EMAIL, // e.g. your Gmail address
                pass: process.env.SMTP_PASSWORD, // Gmail App Password, NOT your real password
            },
        });
        // Email options
        const mailOptions = {
            from: `"DrConnect" <${process.env.SMTP_EMAIL}>`,
            to: email,
            subject: "DrConnect - Password Reset OTP",
            html: `
        <div style="font-family:sans-serif">
          <h2>Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>Your OTP for resetting your password is:</p>
          <h3>${otp}</h3>
          <p>This OTP will expire in 5 minutes.</p>
        </div>
      `,
        };
        // Send email
        yield transporter.sendMail(mailOptions);
        return res.status(200).json({
            message: "OTP sent successfully to your email",
            status: 200,
        });
    }
    catch (err) {
        console.error("Forgot password error:", err);
        return res.status(500).json({ message: "Server error" });
    }
});
export const verifyOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp, newPassword } = req.body;
        // Verify OTP
        const storedOTP = yield redisClient.get(`password_reset:${email}`);
        if (!storedOTP) {
            return res.status(400).json({
                message: "OTP expired or invalid",
                status: 400
            });
        }
        if (storedOTP !== otp) {
            return res.status(400).json({
                message: "Invalid OTP",
                status: 400
            });
        }
        // OTP verified - update password
        const hashedPassword = yield bcrypt.hash(newPassword, 10);
        yield prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });
        // Delete the OTP from Redis
        yield redisClient.del(`password_reset:${email}`);
        return res.status(200).json({
            message: "Password reset successfully",
            status: 200
        });
    }
    catch (err) {
        console.error("Verify OTP error:", err);
        return res.status(500).json({ message: "Server error" });
    }
});

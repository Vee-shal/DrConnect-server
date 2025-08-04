import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { registerUserSchema, loginUserSchema } from "../validators/userSchemas.js";

dotenv.config();

export const registerUser = async (req: Request, res: Response) => {
  try {
    const parseResult = registerUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: parseResult.error.issues,
      });
    }

    const {
      name,
      email,
      password,
      role,
      phone_number,
      specialization,
      experience,
      license,
      certificate,
    } = parseResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ⛑️ Try to convert certificate safely
    let certificateBuffer: Buffer | null = null;
    if (role === "doctor" && certificate) {
      try {
        certificateBuffer = Buffer.from(certificate, "base64");
      } catch (e) {
        console.error("❌ Invalid base64 certificate:", e);
        return res.status(400).json({ message: "Invalid certificate format." });
      }
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phoneNumber: phone_number,
        password: hashedPassword,
        role,
        specialization: role === "doctor" ? specialization : null,
        experience: role === "doctor" ? experience : null,
        license: role === "doctor" ? license : null,
        certificateURL: certificateBuffer,
      },
    });

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

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
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


export const userLogin = async (req: Request, res: Response) => {
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
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({
        message: "User does not exist. Please register first.",
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password." });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

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
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error:
        typeof error === "object" &&
        error !== null &&
        "message" in error
          ? (error as { message: string }).message
          : String(error),
    });
  }
};

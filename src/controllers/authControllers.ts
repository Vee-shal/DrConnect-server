import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response } from "express";
import {
  registerUserSchema,
  loginUserSchema,
} from "../validators/userSchemas.js";
import { createClient } from "redis";
import nodemailer from "nodemailer";


dotenv.config();

// Redis Client Setup
const redisClient = createClient({
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.connect();





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
      verified,
    } = parseResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check role
    const isDoctor = role === "doctor";
    // Create user based on role
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
        verified : false,
        // certificateURL:
        //   role === "doctor" && certificate
        //     ? Buffer.from(certificate, "base64")
        //     : null,
      },
    });

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

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
        verified,
      },
      token,
      status: 200,
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
        verified: user.verified,
        // certificate: user.certificateURL
        //   ? Buffer.from(user.certificateURL).toString("base64")
        //   : null,
      },
      token,
      status: 200,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error:
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message: string }).message
          : String(error),
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Redis with 5-minute expiry
    await redisClient.setEx(`password_reset:${email}`, 300, otp);

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
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: "OTP sent successfully to your email",
      status: 200,
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    // Verify OTP
    const storedOTP = await redisClient.get(`password_reset:${email}`);

    if (!storedOTP) {
      return res.status(400).json({
        message: "OTP expired or invalid",
        status: 400,
      });
    }

    if (storedOTP !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
        status: 400,
      });
    }

    // Delete the OTP from Redis
    await redisClient.del(`password_reset:${email}`);

    //set flag that otp verified
    await redisClient.setEx(`otp-verified:${email}`, 300, "true");
    return res.status(200).json({
      message: "OTP MATCHED",
      status: 200,
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, newPassword } = req.body;
  const is_verified =
    (await redisClient.get(`otp-verified:${email}`)) === "true";
  // OTP verified - update password
  if (is_verified) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    await redisClient.del(`otp-verified:${email}`);
    return res.status(200).json({
      message: "Password reset successful",
      status: 200,
    });
  } else {
    return res.status(403).json({
      message: "OTP not verified or expired",
      status: 403,
    });
  }
};

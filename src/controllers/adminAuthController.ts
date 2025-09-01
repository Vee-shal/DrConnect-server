import { Request, Response } from "express";
import prisma from "../config/db.js";  // Prisma client
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Find user with role "admin"
    const admin = await prisma.user.findUnique({
      where: { email },
    });

    if (!admin || admin.role !== "admin") {
      return res.status(400).json({ message: "Admin not found" });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

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
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

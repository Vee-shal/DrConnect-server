import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: number;
  role: string;
}

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Not an admin." });
    }

    // Attach admin info to request
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    console.error("Admin Auth Error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

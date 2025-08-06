// src/validators/userSchemas.ts
import { z } from "zod";
export const registerUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["user", "doctor", "admin"]),
    phone_number: z.string().regex(/^[6-9]\d{9}$/, "Invalid phone number"), // adjust based on locale
    specialization: z.string().optional(),
    experience: z.number().int().nonnegative().optional(),
    license: z.string().optional(),
    verified: z.boolean().optional()
    // certificate: z.string().optional(), // base64 string
});
export const loginUserSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    verified: z.boolean().optional()
});

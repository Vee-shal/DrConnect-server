import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { registerUserSchema, loginUserSchema } from '../validators/userSchemas.js';
import { createClient } from 'redis';
import nodemailer from 'nodemailer';

// Initialize Prisma Client
const prisma = new PrismaClient();

dotenv.config();

// Redis Client Setup
const redisClient = createClient({
  username: process.env.REDIS_USERNAME || 'default',
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
 redisClient.connect();

// Types
interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  phoneNumber: string;
  specialization: string | null;
  experience: number | null;
  license: string | null;
  verified: boolean;
  createdAt: Date;
}

interface AuthResponse {
  message: string;
  user?: UserResponse;
  token?: string;
  status?: number;
  errors?: any[];
  error?: string;
}

// Utility function for API responses
const sendResponse = (res: Response, status: number, response: AuthResponse) => {
  return res.status(status).json(response);
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const parseResult = registerUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendResponse(res, 400, {
        message: 'Validation failed',
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
    } = parseResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendResponse(res, 409, { message: 'User already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phoneNumber: phone_number,
        password: hashedPassword,
        role,
        specialization: role === 'doctor' ? specialization : null,
        experience: role === 'doctor' ? experience : null,
        license: role === 'doctor' ? license : null,
        verified: false, // Default to false for new registrations
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phoneNumber: true,
        specialization: true,
        experience: true,
        license: true,
        verified: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    return sendResponse(res, 201, {
      message: 'User registered successfully',
      user,
      token,
    });
  } catch (err) {
    console.error('Register error:', err);
    return sendResponse(res, 500, {
      message: 'Internal server error',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};

export const userLogin = async (req: Request, res: Response) => {
  try {
    const parseResult = loginUserSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendResponse(res, 400, {
        message: 'Validation failed',
        errors: parseResult.error.issues,
      });
    }

    const { email, password } = parseResult.data;

    // Find user with explicit type
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        phoneNumber: true,
        specialization: true,
        experience: true,
        license: true,
        verified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return sendResponse(res, 404, {
        message: 'User does not exist. Please register first.',
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendResponse(res, 401, { message: 'Invalid credentials.' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return sendResponse(res, 200, {
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return sendResponse(res, 500, {
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendResponse(res, 400, { message: 'Email is required' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { name: true, email: true },
    });

    if (!user) {
      // Don't reveal whether user exists for security
      return sendResponse(res, 200, {
        message: 'If an account exists with this email, an OTP has been sent.',
      });
    }

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Redis with 5-minute expiry
    await redisClient.setEx(`password_reset:${email}`, 300, otp);

    // Email configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"DrConnect" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'DrConnect - Password Reset OTP',
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

    await transporter.sendMail(mailOptions);

    return sendResponse(res, 200, {
      message: 'If an account exists with this email, an OTP has been sent.',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return sendResponse(res, 500, {
      message: 'Internal server error',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return sendResponse(res, 400, {
        message: 'Email and OTP are required',
      });
    }

    // Verify OTP
    const storedOTP = await redisClient.get(`password_reset:${email}`);

    if (!storedOTP) {
      return sendResponse(res, 400, {
        message: 'OTP expired or invalid',
      });
    }

    if (storedOTP !== otp) {
      return sendResponse(res, 400, {
        message: 'Invalid OTP',
      });
    }

    // Delete the OTP from Redis and set verification flag
    await redisClient
      .multi()
      .del(`password_reset:${email}`)
      .setEx(`otp-verified:${email}`, 300, 'true')
      .exec();

    return sendResponse(res, 200, {
      message: 'OTP verified successfully',
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return sendResponse(res, 500, {
      message: 'Internal server error',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return sendResponse(res, 400, {
        message: 'Email and new password are required',
      });
    }

    if (newPassword.length < 8) {
      return sendResponse(res, 400, {
        message: 'Password must be at least 8 characters',
      });
    }

    // Check OTP verification
    const isVerified = await redisClient.get(`otp-verified:${email}`);
    if (isVerified !== 'true') {
      return sendResponse(res, 403, {
        message: 'OTP not verified or session expired',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Cleanup Redis keys
    await redisClient.del(`otp-verified:${email}`);

    return sendResponse(res, 200, {
      message: 'Password reset successful',
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return sendResponse(res, 500, {
      message: 'Internal server error',
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
};
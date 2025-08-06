import { Request, Response } from "express";
import prisma from "../config/db.js";

export const updateUser = async (req: Request, res: Response) => {
  try {
    const {
      email,
      onlinePrice,
      offlinePrice,
      clinicName,
      clinicAddress,
      bio,
    } = req.body;

    // 1. Fetch user by email
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "User not found with the given email",
      });
    }

   
    const userId = existingUser.id;

    // 2. Check if doctorProfile exists
    const existingProfile = await prisma.doctorProfile.findUnique({
      where: { userId },
    });

    // 3. Create or update DoctorProfile
    let doctorProfile;
    if (existingProfile) {
      doctorProfile = await prisma.doctorProfile.update({
        where: { userId },
        data: {
          onlinePrice,
          offlinePrice,
          clinicName,
          clinicAddress,
          bio,
          verified: false, // admin will verify later
        },
      });
    } else {
      doctorProfile = await prisma.doctorProfile.create({
        data: {
          userId,
          onlinePrice,
          offlinePrice,
          clinicName,
          clinicAddress,
          bio,
          verified: false,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        updatedUser: existingUser,
        doctorProfile,
      },
      status: 200,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};




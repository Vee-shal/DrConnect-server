import { Request, Response } from "express";
import prisma from "../config/db.js";

// ==========================
// Update or Create Doctor Profile
// ==========================
export const updateDoctor = async (req: Request, res: Response) => {
  try {
    const { email, onlinePrice, offlinePrice, clinicName, clinicAddress, bio } =
      req.body;

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
          verified: false, // Reset to false so admin must verify again
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
      message: "Doctor profile updated successfully",
      data: {
        updatedUser: existingUser,
        doctorProfile,
      },
    });
  } catch (error) {
    console.error("Update Doctor Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating doctor profile",
      error,
    });
  }
};

// ==========================
// Update or Create Patient Profile
// ==========================
export const updatePatient = async (req: Request, res: Response) => {
  try {
    const { email, age, weight, height, gender, bloodGroup } = req.body;

    // 1. Fetch user by email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "Patient not found with the given email",
      });
    }

    const userId = existingUser.id;

    // 2. Check if patient profile exists
    const existingPatient = await prisma.patient.findUnique({
      where: { userId },
    });

    let patientProfile;
    if (existingPatient) {
      // ✅ Update patient if exists
      patientProfile = await prisma.patient.update({
        where: { userId },
        data: {
          age,
          weight,
          height,
          gender,
          bloodGroup,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Patient updated successfully",
        data: {
          updatedUser: existingUser,
          patientProfile,
        },
      });
    }

    // ✅ Create new patient if not exists
    patientProfile = await prisma.patient.create({
      data: {
        age,
        height,
        weight,
        bloodGroup,
        gender,
        user: { connect: { id: userId } }, // Correctly connect to existing user
      },
    });

    return res.status(200).json({
      success: true,
      message: "New patient created successfully",
      data: {
        createdUser: existingUser,
        patientProfile,
      },
    });
  } catch (error) {
    console.error("Update Patient Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating patient profile",
      error,
    });
  }
};

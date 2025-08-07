import { Request, Response } from "express";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getVerifiedDoctorsWithProfile = async (req : Request, res : Response) => {
  try {
    const doctors = await prisma.doctorProfile.findMany({
      where: {
        user: {
          role: "doctor",
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            specialization: true,
            experience: true,
            license: true,
            verified: true,
          },
        },
      },
    });

    res.status(200).json(doctors);
  } catch (error) {
    console.error("Error fetching doctor data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

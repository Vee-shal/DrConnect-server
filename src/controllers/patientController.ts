import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getPatient = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // ✅ Find patient with matching user email
    const existingPatient = await prisma.patient.findFirst({
      where: {
        user: { email },
      },
      include: {
        user: true, // Include user details
      },
    });

    if (!existingPatient) {
      return res.status(404).json({
        message: "Patient not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Patient found",
      data: existingPatient,
      success: true,
    });
  } catch (error) {
    console.error("Get Patient Error:", error);
    return res.status(500).json({
      message: "Something went wrong while fetching patient data",
      success: false,
      error,
    });
  }
};

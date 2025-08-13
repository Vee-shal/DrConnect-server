import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";

const prisma = new PrismaClient();

export enum ConsultationMode {
  OFFLINE = "OFFLINE",
  ONLINE = "ONLINE",
}

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { patientId, doctorId, reason, mode, requestedTime } = req.body;

    if (!patientId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Patient not logged in" });
    }

    if (!doctorId || !mode) {
      return res
        .status(400)
        .json({ message: "doctorId and mode are required" });
    }

    if (
      !Object.values(ConsultationMode).includes(
        mode.toUpperCase() as ConsultationMode
      )
    ) {
      return res.status(400).json({ message: "Invalid mode value" });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: Number(patientId),
        doctorId: Number(doctorId),
        reason,
        mode: mode.toUpperCase() as ConsultationMode,
        status: "ACCEPTED",
        scheduledAt : null
      },
    });

    return res
      .status(201)
      .json({ message: "Appointment request created", appointment });
  } catch (error) {
    console.error("Create appointment error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAppointments = async (req: Request, res: Response) => {
  try {
    let whereClause: any = {};

    // Doctor filter
    if (typeof req.query.doctorId === "string") {
      whereClause.doctorId = parseInt(req.query.doctorId, 10);
    }

    // Patient filter
    if (typeof req.query.patientId === "string") {
      whereClause.patientId = parseInt(req.query.patientId, 10);
    }

    // Status filter
    if (typeof req.query.status === "string") {
      const validStatuses = [
        "PENDING",
        "ACCEPTED",
        "REJECTED",
        "COMPLETED",
        "ACTIVE",
      ];
      const status = req.query.status.toUpperCase();
      if (validStatuses.includes(status)) {
        whereClause.status = status;
      }
    }

    // Time filter: today, week, month
    if (typeof req.query.time === "string") {
      const now = new Date();

      if (req.query.time === "today") {
        whereClause.createdAt = {
          gte: startOfDay(now),
          lte: endOfDay(now),
        };
      } else if (req.query.time === "week") {
        whereClause.createdAt = {
          gte: startOfWeek(now, { weekStartsOn: 1 }), // Monday
          lte: endOfWeek(now, { weekStartsOn: 1 }),
        };
      } else if (req.query.time === "month") {
        whereClause.createdAt = {
          gte: startOfMonth(now),
          lte: endOfMonth(now),
        };
      }
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            role: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            role: true,
            specialization: true,
            experience: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error("❌ Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
    });
  }
};

export const updateAppointmentDetails = async (req: Request, res: Response) => {
  const { scheduledAt, appointmentId } = req.body;
  const foundAppointment = await prisma.appointment.findFirst({
    where: { id: appointmentId },
  });
  if (!foundAppointment) {
    res.status(401).json({
      success: false,
      message: "No appointment found with that id",
    });
  }

  const updatedAppointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
       scheduledAt,
    },
  });
};

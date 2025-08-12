import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export enum ConsultationMode {
  OFFLINE = "OFFLINE",
  ONLINE = "ONLINE",
}

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { doctorId, reason, mode } = req.body;
    const patientId = (req as any).user?.id;

    if (!patientId) {
      return res.status(401).json({ message: 'Unauthorized: Patient not logged in' });
    }

    if (!doctorId || !mode) {
      return res.status(400).json({ message: 'doctorId and mode are required' });
    }

    if (!Object.values(ConsultationMode).includes(mode.toUpperCase() as ConsultationMode)) {
      return res.status(400).json({ message: 'Invalid mode value' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        reason,
        mode: mode.toUpperCase() as ConsultationMode,
        status: 'PENDING',
      },
    });


    return res.status(201).json({ message: 'Appointment request created', appointment });
  } catch (error) {
    console.error('Create appointment error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
const prisma = new PrismaClient();
export var ConsultationMode;
(function (ConsultationMode) {
    ConsultationMode["OFFLINE"] = "OFFLINE";
    ConsultationMode["ONLINE"] = "ONLINE";
})(ConsultationMode || (ConsultationMode = {}));
export const createAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { patientId, doctorId, reason, mode } = req.body;
        if (!patientId) {
            return res.status(401).json({ message: 'Unauthorized: Patient not logged in' });
        }
        if (!doctorId || !mode) {
            return res.status(400).json({ message: 'doctorId and mode are required' });
        }
        if (!Object.values(ConsultationMode).includes(mode.toUpperCase())) {
            return res.status(400).json({ message: 'Invalid mode value' });
        }
        const appointment = yield prisma.appointment.create({
            data: {
                patientId,
                doctorId,
                reason,
                mode: mode.toUpperCase(),
                status: 'PENDING',
            },
        });
        return res.status(201).json({ message: 'Appointment request created', appointment });
    }
    catch (error) {
        console.error('Create appointment error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
export const getAppointments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let whereClause = {};
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
            const validStatuses = ["PENDING", "ACCEPTED", "REJECTED", "COMPLETED", "ACTIVE"];
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
            }
            else if (req.query.time === "week") {
                whereClause.createdAt = {
                    gte: startOfWeek(now, { weekStartsOn: 1 }), // Monday
                    lte: endOfWeek(now, { weekStartsOn: 1 }),
                };
            }
            else if (req.query.time === "month") {
                whereClause.createdAt = {
                    gte: startOfMonth(now),
                    lte: endOfMonth(now),
                };
            }
        }
        const appointments = yield prisma.appointment.findMany({
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
    }
    catch (error) {
        console.error("❌ Error fetching appointments:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch appointments",
        });
    }
});

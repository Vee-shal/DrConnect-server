var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PrismaClient } from "@prisma/client";
import nodemailer from 'nodemailer';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, } from "date-fns";
import axios from "axios";
const prisma = new PrismaClient();
export var ConsultationMode;
(function (ConsultationMode) {
    ConsultationMode["OFFLINE"] = "OFFLINE";
    ConsultationMode["ONLINE"] = "ONLINE";
})(ConsultationMode || (ConsultationMode = {}));
export const createAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!Object.values(ConsultationMode).includes(mode.toUpperCase())) {
            return res.status(400).json({ message: "Invalid mode value" });
        }
        const appointment = yield prisma.appointment.create({
            data: {
                patientId: Number(patientId),
                doctorId: Number(doctorId),
                reason,
                mode: mode.toUpperCase(),
                status: "ACCEPTED",
                scheduledAt: null,
            },
        });
        return res
            .status(200)
            .json({ message: "Appointment request created", appointment });
    }
    catch (error) {
        console.error("Create appointment error:", error);
        return res.status(500).json({ message: "Internal server error" });
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
const ZOOM_ACCOUNT_ID = "iiTC3M2YRhK_lmI8Oq-vqQ";
const ZOOM_CLIENT_ID = "kJWdXoesRviL_mnZXymnyA";
const ZOOM_CLIENT_SECRET = "oPnAKqppAmrGJqoJasvdVnWcDR98HQsm";
// Get Zoom Access Token
function getZoomAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        const tokenUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`;
        const authHeader = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString("base64");
        const response = yield axios.post(tokenUrl, null, {
            headers: {
                Authorization: `Basic ${authHeader}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        return response.data.access_token;
    });
}
// Create Zoom Meeting
function createZoomMeeting(hostEmail, scheduledAt) {
    return __awaiter(this, void 0, void 0, function* () {
        const accessToken = yield getZoomAccessToken();
        const meetingDetails = {
            topic: "DrConnect Appointment",
            type: 2, // Scheduled meeting
            start_time: new Date(scheduledAt).toISOString(),
            duration: 30, // minutes
            timezone: "Asia/Kolkata",
            settings: {
                host_video: true,
                participant_video: true,
                join_before_host: false,
            },
        };
        const response = yield axios.post(`https://api.zoom.us/v2/users/me/meetings`, meetingDetails, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });
        return response.data.join_url;
    });
}
// Controller
export const updateAppointmentDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { scheduledAt, appointmentId, status, doctorEmail, patientEmail, mode } = req.body;
        const foundAppointment = yield prisma.appointment.findUnique({
            where: { id: appointmentId },
        });
        if (!foundAppointment) {
            return res.status(404).json({
                success: false,
                message: "No appointment found with that id",
            });
        }
        // Create Zoom meeting if online appointment & accepted
        let meetingLink = null;
        if ((status === null || status === void 0 ? void 0 : status.toLowerCase()) === "accepted" && (mode === null || mode === void 0 ? void 0 : mode.toLowerCase()) === "online") {
            meetingLink = yield createZoomMeeting(doctorEmail, scheduledAt);
        }
        // Update appointment in DB
        const updatedAppointment = yield prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                scheduledAt,
                status: status.toUpperCase(),
                meetingLink: meetingLink !== null && meetingLink !== void 0 ? meetingLink : undefined,
            },
        });
        // Send emails if accepted
        if ((status === null || status === void 0 ? void 0 : status.toLowerCase()) === "accepted") {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.SMTP_EMAIL,
                    pass: process.env.SMTP_PASSWORD,
                },
            });
            let patientHtml = `<p>Hi, your appointment scheduled on <strong>${scheduledAt}</strong> has been accepted by the doctor.</p>`;
            let doctorHtml = `<p>Hi Doctor, the appointment scheduled on <strong>${scheduledAt}</strong> has been accepted.</p>`;
            if (meetingLink) {
                patientHtml += `<p>Join your online appointment here: <a href="${meetingLink}">${meetingLink}</a></p>`;
                doctorHtml += `<p>Join the online appointment here: <a href="${meetingLink}">${meetingLink}</a></p>`;
            }
            yield Promise.all([
                transporter.sendMail({
                    from: `"DrConnect" <${process.env.SMTP_EMAIL}>`,
                    to: patientEmail,
                    subject: "Your Appointment is Accepted!",
                    html: patientHtml,
                }),
                transporter.sendMail({
                    from: `"DrConnect" <${process.env.SMTP_EMAIL}>`,
                    to: doctorEmail,
                    subject: "New Appointment Accepted",
                    html: doctorHtml,
                }),
            ]);
        }
        return res.status(200).json({
            success: true,
            message: "Appointment details updated successfully",
            data: updatedAppointment,
        });
    }
    catch (error) {
        console.error("Error updating appointment:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while updating the appointment",
            error: error instanceof Error ? error.message : String(error),
        });
    }
});

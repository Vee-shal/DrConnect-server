var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import prisma from "../config/db.js";
import cloudinary from "../utils/cloudinary.js";
// Controller function to get all users, optionally filtered by role
export const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { role } = req.query; // query param ?role=doctor
        const users = yield prisma.user.findMany({
            where: role ? { role: String(role) } : {}, // filter if role is provided
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phoneNumber: true,
                specialization: true,
                experience: true,
                license: true,
                certificate: true,
                profilePhoto: true,
                verified: true,
                createdAt: true,
                doctorProfile: true,
                patientProfile: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
});
export const deleteDoctor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const doctorId = Number(req.params.id);
    try {
        // Check if doctor exists
        const doctor = yield prisma.user.findUnique({
            where: { id: doctorId },
        });
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        // Optional: Delete certificate/profilePhoto from Cloudinary
        if (doctor.certificate) {
            const publicId = getPublicIdFromUrl(doctor.certificate);
            yield cloudinary.uploader.destroy(publicId);
        }
        if (doctor.profilePhoto) {
            const publicId = getPublicIdFromUrl(doctor.profilePhoto);
            yield cloudinary.uploader.destroy(publicId);
        }
        // Delete doctor
        yield prisma.user.delete({
            where: { id: doctorId },
        });
        res.status(200).json({ message: "Doctor deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting doctor:", error);
        res.status(500).json({ message: "Server Error", error: error instanceof Error ? error.message : String(error) });
    }
});
// Helper function to extract Cloudinary public ID from URL
const getPublicIdFromUrl = (url) => {
    const parts = url.split("/");
    const fileName = parts[parts.length - 1];
    return fileName.split(".")[0]; // remove extension
};
export const verifyDoctor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const doctorId = Number(req.params.id);
    try {
        // Check if doctor exists
        const doctor = yield prisma.user.findUnique({
            where: { id: doctorId },
        });
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        if (doctor.verified) {
            return res.status(400).json({ message: "Doctor is already verified" });
        }
        // Update verified status
        const updatedDoctor = yield prisma.user.update({
            where: { id: doctorId },
            data: { verified: true },
        });
        res.status(200).json({
            message: "Doctor verified successfully",
            data: updatedDoctor,
        });
    }
    catch (error) {
        console.error("Error verifying doctor:", error);
        res.status(500).json({
            message: "Server Error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
});
export const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = Number(req.params.id);
    try {
        // Check if user exists
        const user = yield prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Direct delete from User table
        yield prisma.user.delete({
            where: { id: userId },
        });
        res.status(200).json({ message: "User deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({
            message: "Server Error",
            error: error instanceof Error ? error.message : String(error),
        });
    }
});
// ✅ Get All Appointments with Doctor & Patient details
export const getAllAppointments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const appointments = yield prisma.appointment.findMany({
            include: {
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        specialization: true,
                    },
                },
                patient: {
                    select: {
                        id: true,
                        name: true,
                        phoneNumber: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json({ success: true, appointments });
    }
    catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ success: false, message: "Failed to fetch appointments" });
    }
});
// Add a new hospital
export const addHospital = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, address, phone, email, website, description } = req.body;
        if (!name || !address || !phone) {
            return res.status(400).json({ message: "Name, address and phone are required." });
        }
        const hospital = yield prisma.hospital.create({
            data: { name, address, phone, email, website, description },
        });
        res.status(201).json({ message: "Hospital added successfully", hospital });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
// Get all hospitals
export const getAllHospitals = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hospitals = yield prisma.hospital.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json({ hospitals });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

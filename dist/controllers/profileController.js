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
export const updateDoctor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, onlinePrice, offlinePrice, clinicName, clinicAddress, bio, } = req.body;
        // 1. Fetch user by email
        const existingUser = yield prisma.user.findUnique({ where: { email } });
        if (!existingUser) {
            return res.status(400).json({
                success: false,
                message: "User not found with the given email",
            });
        }
        const userId = existingUser.id;
        // 2. Check if doctorProfile exists
        const existingProfile = yield prisma.doctorProfile.findUnique({
            where: { userId },
        });
        // 3. Create or update DoctorProfile
        let doctorProfile;
        if (existingProfile) {
            doctorProfile = yield prisma.doctorProfile.update({
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
        }
        else {
            doctorProfile = yield prisma.doctorProfile.create({
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
    }
    catch (error) {
        console.error("Update error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error,
        });
    }
});
export const updatePatients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
});

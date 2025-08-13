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
export const getVerifiedDoctorsWithProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doctors = yield prisma.doctorProfile.findMany({
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
    }
    catch (error) {
        console.error("Error fetching doctor data:", error);
        res.status(500).json({ message: "Server error" });
    }
});

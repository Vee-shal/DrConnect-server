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
export const getPatient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        // ✅ Find patient with matching user email
        const existingPatient = yield prisma.patient.findFirst({
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
    }
    catch (error) {
        console.error("Get Patient Error:", error);
        return res.status(500).json({
            message: "Something went wrong while fetching patient data",
            success: false,
            error,
        });
    }
});

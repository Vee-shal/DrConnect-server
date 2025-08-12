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
const prisma = new PrismaClient();
export var ConsultationMode;
(function (ConsultationMode) {
    ConsultationMode["OFFLINE"] = "OFFLINE";
    ConsultationMode["ONLINE"] = "ONLINE";
})(ConsultationMode || (ConsultationMode = {}));
export const createAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { doctorId, reason, mode } = req.body;
        const patientId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
                appointmentDate: undefined,
                appointmentTime: null,
            },
        });
        return res.status(201).json({ message: 'Appointment request created', appointment });
    }
    catch (error) {
        console.error('Create appointment error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { uploadTOCloudinary } from "../middlewares/upload.js";
import prisma from "../config/db.js";
export const uploadProfileController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const { email } = req.body; // frontend se email bhejna zaruri
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        // 1. Find user by email
        const existingUser = yield prisma.user.findUnique({ where: { email } });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }
        // 2. Upload file to Cloudinary
        const imageUrl = yield uploadTOCloudinary(req.file);
        // 3. Update user's profile photo
        const updatedUser = yield prisma.user.update({
            where: { id: existingUser.id },
            data: { profilePhoto: imageUrl },
        });
        res.status(200).json({ success: true, imageUrl, user: updatedUser });
    }
    catch (err) {
        console.error("Upload Profile Error:", err);
        res.status(500).json({ success: false, message: "Upload failed", error: err.message });
    }
});

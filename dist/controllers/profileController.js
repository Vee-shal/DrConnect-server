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
export const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { offlinePrice, onlinePrice, email } = req.body;
        const existingUser = yield prisma.user.findFirst({ where: { email } });
        if (!existingUser) {
            return res.status(400).json({
                success: false,
                message: "User not found with the given email",
            });
        }
        const updatedUser = yield prisma.user.update({
            where: { email },
            data: Object.assign(Object.assign({}, existingUser), { offlinePrice,
                onlinePrice }),
        });
        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: { updatedUser },
            status: 200,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ success: false, message: "Something went wrong", error });
    }
});

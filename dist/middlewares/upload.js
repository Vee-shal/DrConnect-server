var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import multer from "multer";
import cloudinary from "../utils/cloudinary.js";
const storage = multer.memoryStorage();
const parser = multer({ storage });
export const uploadTOCloudinary = (file) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: "drconnect", resource_type: "auto" }, (error, result) => {
            if (error)
                reject(error);
            resolve((result === null || result === void 0 ? void 0 : result.secure_url) || "");
        });
        stream.end(file.buffer);
    });
});
export default parser;

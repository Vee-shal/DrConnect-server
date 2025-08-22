import multer from "multer";
import cloudinary from "../utils/cloudinary.js";

const storage = multer.memoryStorage();
const parser = multer({ storage });

export const uploadTOCloudinary = async (file:  Express.Multer.File) => {
    return new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {folder:"drconnect", resource_type:"auto"},
            (error,result)=>{
                if(error)reject(error);
                resolve(result?.secure_url || "");
            }
        );
        stream.end(file.buffer);
    })
}

export default parser;
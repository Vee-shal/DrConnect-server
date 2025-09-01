import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from  "./routes/profileRoutes.js"
import doctorRoutes from  "./routes/doctorRoutes.js"
import patientRoutes from  "./routes/patientRoutes.js"
import appointmentRoutes from "./routes/appointmentRoute.js";
import uploadRoutes from "./routes/uploadRoute.js";
import chatbotRouter from "./routes/chatbot.js";
import chatRoute from "./routes/chatRoute.js";
import adminAuthRoutes from "./routes/adminAuthRoute.js"; 
import adminRoutes from "./routes/adminRoute.js"; 
dotenv.config();


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth",authRoutes);
app.use("/api/profile" , profileRoutes)
app.use("/api/doctor" , doctorRoutes)
app.use("/api/patient" , patientRoutes)
app.use("/api/appointment", appointmentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/chatbot", chatbotRouter);
app.use("/api/chat", chatRoute);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin-all", adminRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

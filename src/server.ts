import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from  "./routes/profileRoutes.js"
import doctorRoutes from  "./routes/doctorRoutes.js"

dotenv.config();


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth",authRoutes);
app.use("/api/profile" , profileRoutes)
app.use("/api/doctor" , doctorRoutes)



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

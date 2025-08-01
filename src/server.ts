import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";



dotenv.config();


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth",authRoutes);




// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

///this is test
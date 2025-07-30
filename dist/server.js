import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// Load environment variables
dotenv.config();
// Create express app
const app = express();
// Middleware
app.use(cors());
app.use(express.json());
// Basic route
app.get("/", (req, res) => {
    res.send("Hello from DrConnect Server! 🚀");
});
// Start server
const PORT = process.env.PORT || 5000; // Changed from DB_PORT to PORT
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

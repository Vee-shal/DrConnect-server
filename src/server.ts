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
  res.send("ok 🚀");
});

// 🔥 Dummy /users route
app.get("/users", (req, res) => {
  const dummyUser = {
    id: 1,
    name: "Dr. Ayesha Khan",
    email: "ayesha.khan@example.com",
    specialty: "Dermatologist",
    available: true,
    experience: "7 years",
    rating: 4.8,
    location: "Mumbai, India"
  };

  res.status(200).json({
    success: true,
    message: "Dummy user fetched successfully",
    data: dummyUser
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

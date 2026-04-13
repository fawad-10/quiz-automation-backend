const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// =======================
// Middleware
// =======================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://quiz-automation-frontend.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));

// =======================
// Root Route (Health Check)
// =======================
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Quiz Automation Backend is running successfully!",
    endpoints: {
      createForm: "/api/create-form",
    },
  });
});

// =======================
// Create Google Form Route
// =======================
app.post("/api/create-form", async (req, res) => {
  try {
    const { title, questions, email, phones } = req.body;

    // Validate input
    if (!title || !questions || !email || !phones) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields.",
      });
    }

    console.log("========== NEW REQUEST ==========");
    console.log("Title:", title);
    console.log("Instructor Email:", email);
    console.log("Phones:", phones);
    console.log("Questions Count:", questions.length);
    console.log("=================================");

    // Google Apps Script URL from environment variable
    const SCRIPT_URL = process.env.GAS_URL;

    if (!SCRIPT_URL) {
      throw new Error("GAS_URL is not defined in environment variables.");
    }

    // Send data to Google Apps Script
    const fetchResponse = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, questions, email, phones }),
    });

    const result = await fetchResponse.json();

    res.json(result);
  } catch (error) {
    console.error("Error creating Google Form:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// =======================
// Start Server
// =======================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
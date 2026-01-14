import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { query } from "./db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Test database connection
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await query(
      "SELECT NOW() as current_time, version() as db_version"
    );
    res.json({
      status: "success",
      message: "Database connection successful",
      data: {
        currentTime: result.rows[0].current_time,
        version: result.rows[0].db_version,
      },
    });
  } catch (error) {
    console.error("Database test error:", error);
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
// Get all medicos (doctors)
app.get("/medicos", async (req, res) => {
  try {
    const result = await query(
      `SELECT name, title, credentials, experience, description, image 
			FROM users 
			WHERE role = 'Médico' AND title IS NOT NULL
			ORDER BY name`
    );

    res.json({
      medicos: result.rows,
      message: "Medicos fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching medicos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

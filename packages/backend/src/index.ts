import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { query } from "./db.js";
import { comparePassword, hashPassword } from "./utils/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
	res.json({ status: "ok" });
});

// Test database connection
app.get("/api/test-db", async (req, res) => {
	try {
		const result = await query("SELECT NOW() as current_time, version() as db_version");
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

// Auth endpoints
app.post("/api/auth/login", async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ error: "Email and password are required" });
		}

		// Find user by email
		const result = await query(
			"SELECT id, email, password, name, role FROM users WHERE email = $1",
			[email.toLowerCase()],
		);

		if (result.rows.length === 0) {
			return res.status(401).json({ error: "Invalid email or password" });
		}

		const user = result.rows[0];

		// Verify password
		const isPasswordValid = await comparePassword(password, user.password);

		if (!isPasswordValid) {
			return res.status(401).json({ error: "Invalid email or password" });
		}

		// Return user data (without password)
		res.json({
			success: true,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role || "Médico",
			},
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Signup endpoint
app.post("/api/auth/signup", async (req, res) => {
	try {
		const { email, password, name } = req.body;

		if (!email || !password || !name) {
			return res
				.status(400)
				.json({ error: "Email, password, and name are required" });
		}

		// Check if user already exists
		const existingUser = await query("SELECT id FROM users WHERE email = $1", [
			email.toLowerCase(),
		]);

		if (existingUser.rows.length > 0) {
			return res.status(409).json({ error: "User with this email already exists" });
		}

		// Hash password
		const hashedPassword = await hashPassword(password);

		// Create user
		const result = await query(
			"INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, role",
			[email.toLowerCase(), hashedPassword, name],
		);

		const newUser = result.rows[0];

		res.status(201).json({
			success: true,
			user: {
				id: newUser.id,
				name: newUser.name,
				email: newUser.email,
				role: newUser.role || "Médico",
			},
		});
	} catch (error) {
		console.error("Signup error:", error);
		res.status(500).json({ error: "Internal server error" });
	}
});

// Get all medicos (doctors)
app.get("/medicos", async (req, res) => {
	try {
		const result = await query(
			`SELECT name, title, credentials, experience, description, image 
			FROM users 
			WHERE role = 'Médico' AND title IS NOT NULL
			ORDER BY name`,
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



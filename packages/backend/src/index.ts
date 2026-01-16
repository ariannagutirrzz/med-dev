import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import appointmentRoutes from "./routes/appointmentRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import medicalRecordsRoutes from "./routes/medicalRecordsRoutes.js"
import patientsRoutes from "./routes/patientsRoutes.js"
import surgeryRoutes from "./routes/surgeryRoutes.js"
import userRoutes from "./routes/userRoutes.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/appointments", appointmentRoutes)
app.use("/api/surgeries", surgeryRoutes)
app.use("/api/patients", patientsRoutes)
app.use("/api/medicalRecords", medicalRecordsRoutes)

// Start server
app.listen(PORT, () => {
	console.log(`Backend server running on http://localhost:${PORT}`)
})

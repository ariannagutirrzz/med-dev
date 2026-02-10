import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import swaggerUI from "swagger-ui-express"
import appointmentRoutes from "./routes/appointmentRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import currencyRoutes from "./routes/currencyRoutes.js"
import medicalRecordsRoutes from "./routes/medicalRecordsRoutes.js"
import notificationRoutes from "./routes/notificationRoutes.js"
import patientsRoutes from "./routes/patientsRoutes.js"
import settingsRoutes from "./routes/settingsRoutes.js"
import suppliesRoutes from "./routes/suppliesRoutes.js"
import surgeryRoutes from "./routes/surgeryRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import swaggerSpec from "./utils/swagger.js"

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
app.use("/api/supplies", suppliesRoutes)
app.use("/api/settings", settingsRoutes)
app.use("/api/currency", currencyRoutes)
app.use("/api/notifications", notificationRoutes)

// Docs
app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec))

// Start server
app.listen(PORT, () => {
	console.log(`Backend server running on http://localhost:${PORT}`)
})

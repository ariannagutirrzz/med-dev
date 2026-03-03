import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import swaggerUI from "swagger-ui-express"
import aiRoutes from "./routes/aiRoutes.js"
import appointmentRoutes from "./routes/appointmentRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import currencyRoutes from "./routes/currencyRoutes.js"
import demandPredictionRoutes from "./routes/demandPredictionRoutes.js"
import doctorAvailabilityRoutes from "./routes/doctorAvailabilityRoutes.js"
import doctorUnavailabilityRoutes from "./routes/doctorUnavailabilityRoutes.js"
import medicalRecordsImagesRouter from "./routes/medicalRecordsImagesRoutes.js"
import medicalRecordsRoutes from "./routes/medicalRecordsRoutes.js"
import notificationRoutes from "./routes/notificationRoutes.js"
import patientsRoutes from "./routes/patientsRoutes.js"
import reportRoutes from "./routes/reportRoutes.js"
import serviceRoutes from "./routes/serviceRoutes.js"
import settingsRoutes from "./routes/settingsRoutes.js"
import suppliesRoutes from "./routes/suppliesRoutes.js"
import surgeryRoutes from "./routes/surgeryRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import swaggerSpec from "./utils/swagger.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(
	cors({
		// Reflexiona el origin de la petición (por ejemplo http://localhost:5173 en desarrollo)
		origin: true,
		credentials: true,
		allowedHeaders: ["Content-Type", "Authorization"],
		exposedHeaders: ["Content-Disposition", "Content-Type"],
	}),
)
app.use(express.json())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/ai", aiRoutes)
app.use("/api/users", userRoutes)
app.use("/api/appointments", appointmentRoutes)
app.use("/api/surgeries", surgeryRoutes)
app.use("/api/patients", patientsRoutes)
app.use("/api/medicalRecords", medicalRecordsRoutes)
app.use("/api/supplies", suppliesRoutes)
app.use("/api/settings", settingsRoutes)
app.use("/api/currency", currencyRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/services", serviceRoutes)
app.use("/api/reports", reportRoutes)
app.use("/api/demand-prediction", demandPredictionRoutes)
app.use("/api/doctor-availability", doctorAvailabilityRoutes)
app.use("/api/doctor-unavailability", doctorUnavailabilityRoutes)
app.use("/api/medical-records-images", medicalRecordsImagesRouter)

// Docs
app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec))

// Start server
app.listen(PORT, () => {
	console.log(`Backend server running on http://localhost:${PORT}`)
})

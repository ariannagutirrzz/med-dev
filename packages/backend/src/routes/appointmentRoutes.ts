import { Router } from "express"
import {
	createAppointment,
	deleteAppointment,
	getAllAppointments,
	getAppointmentById,
	updateAppointment,
} from "../controllers/AppointmentController"
import { authenticate } from "../middleware/auth"
import { isMedic } from "../middleware/roleAuth"

const appointmentRoutes: Router = Router()

appointmentRoutes.use(authenticate)

appointmentRoutes.post("/", createAppointment)
appointmentRoutes.get("/", getAllAppointments)
appointmentRoutes.get("/:id", getAppointmentById)
appointmentRoutes.patch("/:id", updateAppointment)
appointmentRoutes.delete("/:id", isMedic, deleteAppointment)

export default appointmentRoutes

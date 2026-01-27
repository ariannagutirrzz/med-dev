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

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Crear una cita médica
 *     tags:
 *     - Appointments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doctor_id:
 *                 type: string
 *                 example: "7595182"
 *               appointment_date:
 *                 type: string
 *                 example: "2026-05-20T14:30:00"
 *               status:
 *                 type: string
 *                 example: "scheduled"
 *               notes:
 *                 type: string
 *                 example: "Cita por problemas respiratorios"
 *   get:
 *     summary: Obtener todas las citas médicas
 *     tags:
 *     - Appointments
 * /api/appointments/{id}:
 *   get:
 *     summary: Obtener una cita médica por su ID
 *     parameters:
 *     - in: path
 *       name: id
 *       description: ID de la cita médica
 *     tags:
 *     - Appointments
 *   patch:
 *     summary: Actualizar una cita médica por su ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doctor_id:
 *                 type: string
 *                 example: "7595182"
 *               appointment_date:
 *                 type: string
 *                 example: "2026-05-20T14:30:00"
 *               status:
 *                 type: string
 *                 example: "scheduled"
 *               notes:
 *                 type: string
 *                 example: "Cita por problemas respiratorios"
 *     tags:
 *     - Appointments
 *   delete:
 *     summary: Eliminar una cita médica por su ID
 *     tags:
 *     - Appointments
 *
 */

appointmentRoutes.use(authenticate)

appointmentRoutes.post("/", createAppointment)
appointmentRoutes.get("/", getAllAppointments)
appointmentRoutes.get("/:id", getAppointmentById)
appointmentRoutes.patch("/:id", updateAppointment)
appointmentRoutes.delete("/:id", isMedic, deleteAppointment)

export default appointmentRoutes

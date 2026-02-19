import { Router } from "express"
import {
	createDoctorAvailability,
	deleteDoctorAvailability,
	getAvailableTimeSlots,
	getDoctorAvailability,
	updateDoctorAvailability,
} from "../controllers/DoctorAvailabilityController"
import { authenticate } from "../middleware/auth"

const doctorAvailabilityRoutes: Router = Router()

/**
 * @swagger
 * /api/doctor-availability:
 *   post:
 *     summary: Create doctor availability slot
 *     tags:
 *     - Doctor Availability
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               day_of_week:
 *                 type: integer
 *                 example: 1
 *                 description: "0 = Sunday, 6 = Saturday"
 *               start_time:
 *                 type: string
 *                 example: "09:00"
 *               end_time:
 *                 type: string
 *                 example: "17:00"
 *               is_active:
 *                 type: boolean
 *                 example: true
 *   get:
 *     summary: Get all availability slots for a doctor
 *     tags:
 *     - Doctor Availability
 * /api/doctor-availability/:doctor_id/available-slots:
 *   get:
 *     summary: Get available time slots for a specific date
 *     tags:
 *     - Doctor Availability
 *     parameters:
 *     - in: query
 *       name: date
 *       required: true
 *       schema:
 *         type: string
 *         format: date
 *         example: "2026-02-20"
 * /api/doctor-availability/:id:
 *   patch:
 *     summary: Update doctor availability slot
 *     tags:
 *     - Doctor Availability
 *   delete:
 *     summary: Delete doctor availability slot
 *     tags:
 *     - Doctor Availability
 */

doctorAvailabilityRoutes.use(authenticate)

doctorAvailabilityRoutes.post("/", createDoctorAvailability)
doctorAvailabilityRoutes.get("/:doctor_id", getDoctorAvailability)
doctorAvailabilityRoutes.get(
	"/:doctor_id/available-slots",
	getAvailableTimeSlots,
)
doctorAvailabilityRoutes.patch("/:id", updateDoctorAvailability)
doctorAvailabilityRoutes.delete("/:id", deleteDoctorAvailability)

export default doctorAvailabilityRoutes

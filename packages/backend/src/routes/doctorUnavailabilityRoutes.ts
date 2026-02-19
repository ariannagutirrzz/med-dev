import { Router } from "express"
import {
	checkDateUnavailable,
	createDoctorUnavailability,
	deleteDoctorUnavailability,
	getDoctorUnavailability,
	updateDoctorUnavailability,
} from "../controllers/DoctorUnavailabilityController"
import { authenticate } from "../middleware/auth"

const doctorUnavailabilityRoutes: Router = Router()

/**
 * @swagger
 * /api/doctor-unavailability:
 *   post:
 *     summary: Create doctor unavailability period
 *     tags:
 *     - Doctor Unavailability
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-02-20"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-02-27"
 *               reason:
 *                 type: string
 *                 example: "Vacaciones"
 *               is_active:
 *                 type: boolean
 *                 example: true
 *   get:
 *     summary: Get all unavailability periods for a doctor
 *     tags:
 *     - Doctor Unavailability
 * /api/doctor-unavailability/:doctor_id/check:
 *   get:
 *     summary: Check if a specific date is unavailable
 *     tags:
 *     - Doctor Unavailability
 *     parameters:
 *     - in: query
 *       name: date
 *       required: true
 *       schema:
 *         type: string
 *         format: date
 *         example: "2026-02-20"
 * /api/doctor-unavailability/:id:
 *   patch:
 *     summary: Update doctor unavailability period
 *     tags:
 *     - Doctor Unavailability
 *   delete:
 *     summary: Delete doctor unavailability period
 *     tags:
 *     - Doctor Unavailability
 */

doctorUnavailabilityRoutes.use(authenticate)

doctorUnavailabilityRoutes.post("/", createDoctorUnavailability)
doctorUnavailabilityRoutes.get("/:doctor_id", getDoctorUnavailability)
doctorUnavailabilityRoutes.get("/:doctor_id/check", checkDateUnavailable)
doctorUnavailabilityRoutes.patch("/:id", updateDoctorUnavailability)
doctorUnavailabilityRoutes.delete("/:id", deleteDoctorUnavailability)

export default doctorUnavailabilityRoutes

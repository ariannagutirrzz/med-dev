import { Router } from "express"
import {
	createSurgery,
	deleteSurgery,
	getAllSurgeries,
	getSurgeryById,
	updateSurgery,
} from "../controllers/SurgeryController"
import { authenticate } from "../middleware/auth"
import { isMedic } from "../middleware/roleAuth"

const surgeryRoutes: Router = Router()

/**
 * @swagger
 * /api/surgeries:
 *   post:
 *     summary: Agendar una cirugía
 *     tags:
 *     - Surgeries
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patient_id:
 *                 type: string
 *                 example: "30237815"
 *               surgery_date:
 *                 type: string
 *                 example: "2026-02-16 12:30:00"
 *               surgery_type:
 *                 type: string
 *                 example: "Vasectomía"
 *               status:
 *                 type: string
 *                 example: "scheduled"
 *               notes:
 *                 type: string
 *                 example: "Paciente requiere anestesia local"
 *   get:
 *     summary: Obtener todas las cirugías
 *     tags:
 *     - Surgeries
 * /api/surgeries/{id}:
 *   get:
 *     summary: Obtener una cirugía por su ID
 *     parameters:
 *     - in: path
 *       name: id
 *       description: ID de la cirugía
 *     tags:
 *     - Surgeries
 *   patch:
 *     summary: Actualizar una cirugía por su ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patient_id:
 *                 type: string
 *                 example: "30237815"
 *               surgery_date:
 *                 type: string
 *                 example: "2026-02-16 12:30:00"
 *               surgery_type:
 *                 type: string
 *                 example: "Vasectomía"
 *               status:
 *                 type: string
 *                 example: "scheduled"
 *               notes:
 *                 type: string
 *                 example: "Paciente requiere anestesia local"
 *     tags:
 *     - Surgeries
 *   delete:
 *     summary: Eliminar una cirugía por su ID
 *     tags:
 *     - Surgeries
 *
 */

surgeryRoutes.use(authenticate)
surgeryRoutes.use(isMedic)

surgeryRoutes.post("/", createSurgery)
surgeryRoutes.get("/", getAllSurgeries)
surgeryRoutes.get("/:id", getSurgeryById)
surgeryRoutes.patch("/:id", updateSurgery)
surgeryRoutes.delete("/:id", deleteSurgery)

export default surgeryRoutes

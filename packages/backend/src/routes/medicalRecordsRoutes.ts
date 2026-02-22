import { Router } from "express"
import multer from "multer"
import {
	createMedicalRecord,
	deleteMedicalRecord,
	getPatientHistory,
	getRecordById,
	updateMedicalRecord,
} from "../controllers/MedicalRecordsController"
import { authenticate } from "../middleware/auth"
import { isMedic } from "../middleware/roleAuth"

const medicalRecordsRoutes: Router = Router()

/**
 * @swagger
 * /api/medicalRecords:
 *   post:
 *     summary: Crear una historia medica
 *     tags:
 *     - MedicalRecords
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
 *               diagnosis:
 *                 type: string
 *                 example: "Paciente presenta síntomas de gripe"
 * /api/medicalRecords/patient/{id}:
 *   get:
 *     summary: Obtener la historia médica de un paciente por su ID
 *     parameters:
 *     - in: path
 *       name: id
 *       description: ID del paciente
 *     tags:
 *     - MedicalRecords
 * /api/medicalRecords/{id}:
 *   get:
 *     summary: Obtener una historia médica por su ID
 *     tags:
 *     - MedicalRecords
 *   patch:
 *     summary: Actualizar una historia médica por su ID
 *     tags:
 *     - MedicalRecords
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
 *               diagnosis:
 *                 type: string
 *                 example: "Paciente presenta síntomas de gripe"
 *   delete:
 *     summary: Eliminar una historia médica por su ID
 *     tags:
 *     - MedicalRecords
 *
 */

const upload = multer({ storage: multer.memoryStorage() })

medicalRecordsRoutes.use(authenticate)
medicalRecordsRoutes.use(isMedic)

medicalRecordsRoutes.post(
	"/",
	upload.fields([
		{ name: "rx_torax", maxCount: 1 },
		{ name: "tomography", maxCount: 1 },
	]),
	createMedicalRecord,
)
medicalRecordsRoutes.get("/patient/:patientId", getPatientHistory)
medicalRecordsRoutes.get("/:id", getRecordById)
medicalRecordsRoutes.patch(
	"/:id",
	upload.fields([
		{ name: "rx_torax", maxCount: 1 },
		{ name: "tomography", maxCount: 1 },
	]),
	updateMedicalRecord,
)
medicalRecordsRoutes.delete("/:id", deleteMedicalRecord)

export default medicalRecordsRoutes

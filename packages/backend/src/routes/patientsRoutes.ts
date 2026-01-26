import { Router } from "express"
import {
	createPatient,
	deletePatient,
	getAllPatients,
	getPatientById,
	updatePatient,
} from "../controllers/PatientController"
import { authenticate } from "../middleware/auth"
import { isMedic } from "../middleware/roleAuth"

const patientsRoutes: Router = Router()

/**
 * @swagger
 * /api/patients:
 *   post:
 *     summary: Agregar un paciente
 *     tags:
 *     - Patients
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "Ninive"
 *               last_name:
 *                 type: string
 *                 example: "Azuaje"
 *               email:
 *                 type: string
 *                 example: "ninive.azuaje@meddev.com"
 *               document_id:
 *                 type: string
 *                 example: "7695182"
 *               phone:
 *                 type: string
 *                 example: "04149704265"
 *               date_of_birth:
 *                 type: string
 *                 example: "2003-12-07"
 *               gender:
 *                 type: string
 *                 example: "F"
 *               address:
 *                 type: string
 *                 example: "Caminos del doral"
 *   get:
 *     summary: Obtener todos los pacientes
 *     tags:
 *     - Patients
 * /api/patients/{id}:
 *   get:
 *     summary: Obtener un paciente por su ID
 *     parameters:
 *     - in: path
 *       name: id
 *       description: ID del paciente
 *     tags:
 *     - Patients
 *   patch:
 *     summary: Actualizar un paciente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "Ninive"
 *               last_name:
 *                 type: string
 *                 example: "Azuaje"
 *               email:
 *                 type: string
 *                 example: "ninive.azuaje@meddev.com"
 *               document_id:
 *                 type: string
 *                 example: "7695182"
 *               phone:
 *                 type: string
 *                 example: "04149704265"
 *               date_of_birth:
 *                 type: string
 *                 example: "2003-12-07"
 *               gender:
 *                 type: string
 *                 example: "F"
 *               address:
 *                 type: string
 *                 example: "Caminos del doral"
 *     tags:
 *     - Patients
 *   delete:
 *     summary: Eliminar un paciente por su ID
 *     tags:
 *     - Patients
 *
 */

patientsRoutes.use(authenticate)
patientsRoutes.use(isMedic)

patientsRoutes.post("/", createPatient)
patientsRoutes.get("/", getAllPatients)
patientsRoutes.get("/:id", getPatientById)
patientsRoutes.patch("/:id", updatePatient)
patientsRoutes.delete("/:id", deletePatient)

export default patientsRoutes

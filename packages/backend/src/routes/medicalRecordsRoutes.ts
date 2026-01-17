import { Router } from "express"
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

medicalRecordsRoutes.use(authenticate)
medicalRecordsRoutes.use(isMedic)

medicalRecordsRoutes.post("/", createMedicalRecord)
medicalRecordsRoutes.get("/patient/:patientId", getPatientHistory)
medicalRecordsRoutes.get("/:id", getRecordById)
medicalRecordsRoutes.patch("/:id", updateMedicalRecord)
medicalRecordsRoutes.delete("/:id", deleteMedicalRecord)

export default medicalRecordsRoutes

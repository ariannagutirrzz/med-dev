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

patientsRoutes.use(authenticate)
patientsRoutes.use(isMedic)

patientsRoutes.post("/", createPatient)
patientsRoutes.get("/", getAllPatients)
patientsRoutes.get("/:id", getPatientById)
patientsRoutes.patch("/:id", updatePatient)
patientsRoutes.delete("/:id", deletePatient)

export default patientsRoutes

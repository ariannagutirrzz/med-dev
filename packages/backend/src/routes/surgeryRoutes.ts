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

surgeryRoutes.use(authenticate)
surgeryRoutes.use(isMedic)

surgeryRoutes.post("/", createSurgery)
surgeryRoutes.get("/", getAllSurgeries)
surgeryRoutes.get("/:id", getSurgeryById)
surgeryRoutes.patch("/:id", updateSurgery)
surgeryRoutes.delete("/:id", deleteSurgery)

export default surgeryRoutes

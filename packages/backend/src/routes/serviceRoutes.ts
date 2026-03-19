import { Router } from "express"
import {
	createService,
	deleteService,
	getAllServiceTypes,
	getDoctorServicesByDoctorId,
	getMyServices,
	getService,
	getServiceType,
	updateService,
} from "../controllers/ServiceController.js"
import { authenticate } from "../middleware/auth"

const serviceRoutes: Router = Router()

// Public routes
serviceRoutes.get("/types", getAllServiceTypes)
serviceRoutes.get("/types/:id", getServiceType)
serviceRoutes.get("/doctor/:doctorId", getDoctorServicesByDoctorId)

// Protected routes (require authentication)
serviceRoutes.use(authenticate)

serviceRoutes.get("/my-services", getMyServices)
serviceRoutes.get("/:id", getService)
serviceRoutes.post("/", createService)
serviceRoutes.patch("/:id", updateService)
serviceRoutes.delete("/:id", deleteService)

export default serviceRoutes

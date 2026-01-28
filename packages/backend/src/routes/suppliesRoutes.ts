import { Router } from "express"
import {
	createSupply,
	deleteSupply,
	getAllSupplies,
	getLowStockSupplies,
	getSupplyById,
	updateSupply,
} from "../controllers/suppliesController"
import { authenticate } from "../middleware/auth"
import { isMedic } from "../middleware/roleAuth"

const suppliesRoutes: Router = Router()

suppliesRoutes.use(authenticate)
suppliesRoutes.use(isMedic)

suppliesRoutes.post("/", createSupply)
suppliesRoutes.get("/", getAllSupplies)
suppliesRoutes.get("/low-stock", getLowStockSupplies)
suppliesRoutes.get("/:id", getSupplyById)
suppliesRoutes.patch("/:id", updateSupply)
suppliesRoutes.delete("/:id", deleteSupply)

export default suppliesRoutes

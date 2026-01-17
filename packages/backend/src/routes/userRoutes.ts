import { Router } from "express"
import {
	deleteUser,
	getAllUsers,
	getUserByDocumentId,
	updateUser,
} from "../controllers/UserController"
import { authenticate } from "../middleware/auth"

const userRoutes: Router = Router()

userRoutes.use(authenticate)

userRoutes.get("/", getAllUsers)
userRoutes.get("/:id", getUserByDocumentId)
userRoutes.patch("/:id", updateUser)
userRoutes.delete("/:id", deleteUser)

export default userRoutes

import { Router } from "express"
import {
	deleteUser,
	getAllDoctors,
	getAllUsers,
	getUserByDocumentId,
	updateUser,
} from "../controllers/UserController"
import { authenticate } from "../middleware/auth"

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags:
 *     - Users
 * /api/users/{id}:
 *   get:
 *    summary: Obtener un usuario por su document_id (Cedula)
 *    parameters:
 *    - in: path
 *      name: id
 *      description: Cedula del usuario
 *    tags:
 *     - Users
 *   patch:
 *     summary: Actualizar un usuario por su document_id (Cedula)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "ninive.azuaje@meddev.com"
 *               password:
 *                 type: string
 *                 example: "password"
 *               name:
 *                 type: string
 *                 example: "Ninive Azuaje"
 *               document_id:
 *                 type: string
 *                 example: "7695182"
 *               phone:
 *                 type: string
 *                 example: "04149704265"
 *               date_of_birth:
 *                 type: string
 *                 example: "2003-05-24"
 *               gender:
 *                 type: string
 *                 example: "F"
 *               address:
 *                 type: string
 *                 example: "Caminos del Doral"
 *     parameters:
 *     - in: path
 *       name: id
 *       description: Cedula del usuario
 *     tags:
 *       - Users
 *   delete:
 *     summary: Eliminar un usuario por su document_id (Cedula)
 *     parameters:
 *     - in: path
 *       name: id
 *       description: Cedula del usuario
 *     tags:
 *       - Users
 */

const userRoutes: Router = Router()

userRoutes.use(authenticate)

userRoutes.get("/", getAllUsers)
userRoutes.get("/medicos", getAllDoctors)
userRoutes.get("/:id", getUserByDocumentId)
userRoutes.patch("/:id", updateUser)
userRoutes.delete("/:id", deleteUser)

export default userRoutes

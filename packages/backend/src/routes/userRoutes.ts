import { Router } from "express"
import {
	deleteUser,
	getAllDoctors,
	getAllUsers,
	getCurrentUser,
	getUserById,
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
 * /api/users/medicos:
 *   get:
 *     summary: Obtener todos los medicos
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
 *               birthdate:
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

// Rutas compartidas (disponibles para todos los usuarios autenticados)
userRoutes.get("/me", getCurrentUser)
userRoutes.get("/medicos", getAllDoctors) // Disponible para todos para que pacientes puedan ver médicos

// Rutas que requieren permisos específicos
userRoutes.get("/", getAllUsers) // Solo para administradores o médicos (si es necesario)
userRoutes.get("/:id", getUserById)
userRoutes.patch("/:id", updateUser)
userRoutes.delete("/:id", deleteUser)

export default userRoutes

import { Router } from "express"
import {
	changePassword,
	createAccount,
	forgotPassword,
	login,
	resetPassword,
} from "../controllers/AuthController.js"
import { authenticate } from "../middleware/auth.js"

const authRoutes: Router = Router()

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Crear una cuenta de usuario
 *     tags:
 *     - Auth
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
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión de usuario
 *     tags:
 *     - Auth
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
 */

// Signup endpoint
authRoutes.post("/signup", createAccount)
authRoutes.post("/login", login)

// Password recovery (no auth required)
authRoutes.post("/forgot-password", forgotPassword)
authRoutes.post("/reset-password", resetPassword)

// Protected routes
authRoutes.use(authenticate)
authRoutes.patch("/change-password", changePassword)

export default authRoutes

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
} from "../controllers/ServiceController"
import { authenticate } from "../middleware/auth"

const serviceRoutes: Router = Router()

/**
 * @swagger
 * /api/services/types:
 *   get:
 *     summary: Obtener todos los tipos de servicios disponibles
 *     tags:
 *       - Services
 *     responses:
 *       200:
 *         description: Tipos de servicios obtenidos exitosamente
 *       500:
 *         description: Error interno del servidor
 *
 * /api/services/types/{id}:
 *   get:
 *     summary: Obtener un tipo de servicio por ID
 *     tags:
 *       - Services
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tipo de servicio obtenido exitosamente
 *       404:
 *         description: Tipo de servicio no encontrado
 *       500:
 *         description: Error interno del servidor
 *
 * /api/services/my-services:
 *   get:
 *     summary: Obtener todos los servicios del médico autenticado
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Servicios obtenidos exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo médicos pueden acceder
 *       500:
 *         description: Error interno del servidor
 *
 * /api/services/doctor/{doctorId}:
 *   get:
 *     summary: Obtener servicios activos de un médico específico (para pacientes)
 *     tags:
 *       - Services
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Servicios obtenidos exitosamente
 *       500:
 *         description: Error interno del servidor
 *
 * /api/services:
 *   post:
 *     summary: Crear un nuevo servicio para el médico autenticado
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - service_name
 *               - price_usd
 *             properties:
 *               service_name:
 *                 type: string
 *               service_type_id:
 *                 type: integer
 *               price_usd:
 *                 type: number
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Servicio creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo médicos pueden crear servicios
 *       500:
 *         description: Error interno del servidor
 *
 * /api/services/{id}:
 *   get:
 *     summary: Obtener un servicio específico por ID
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Servicio obtenido exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo médicos pueden acceder
 *       404:
 *         description: Servicio no encontrado
 *       500:
 *         description: Error interno del servidor
 *   patch:
 *     summary: Actualizar un servicio
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price_usd:
 *                 type: number
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Servicio actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo médicos pueden actualizar servicios
 *       404:
 *         description: Servicio no encontrado
 *       500:
 *         description: Error interno del servidor
 *   delete:
 *     summary: Eliminar un servicio
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Servicio eliminado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo médicos pueden eliminar servicios
 *       404:
 *         description: Servicio no encontrado
 *       500:
 *         description: Error interno del servidor
 */

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

import { Router } from "express"
import {
	generateAppointmentsReport,
	generateFinancialReport,
	generatePatientsReport,
	generateSurgeriesReport,
} from "../controllers/ReportController"
import { authenticate } from "../middleware/auth"

const reportRoutes: Router = Router()

reportRoutes.use(authenticate)

/**
 * @swagger
 * /api/reports/appointments:
 *   get:
 *     summary: Generar reporte de citas (PDF o Excel)
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, excel]
 *         description: Formato del reporte (pdf o excel)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *         description: Fecha de inicio (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *         description: Fecha de fin (YYYY-MM-DD)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Estado de las citas
 *     responses:
 *       200:
 *         description: Reporte generado exitosamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo médicos pueden generar reportes
 *       500:
 *         description: Error interno del servidor
 *
 * /api/reports/surgeries:
 *   get:
 *     summary: Generar reporte de cirugías (PDF o Excel)
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, excel]
 *         description: Formato del reporte (pdf o excel)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *         description: Fecha de inicio (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *         description: Fecha de fin (YYYY-MM-DD)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Estado de las cirugías
 *     responses:
 *       200:
 *         description: Reporte generado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo médicos pueden generar reportes
 *       500:
 *         description: Error interno del servidor
 *
 * /api/reports/patients:
 *   get:
 *     summary: Generar reporte de pacientes (PDF o Excel)
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, excel]
 *         description: Formato del reporte (pdf o excel)
 *     responses:
 *       200:
 *         description: Reporte generado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo médicos pueden generar reportes
 *       500:
 *         description: Error interno del servidor
 *
 * /api/reports/financial:
 *   get:
 *     summary: Generar reporte financiero (PDF o Excel)
 *     tags:
 *       - Reports
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [pdf, excel]
 *         description: Formato del reporte (pdf o excel)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *         description: Fecha de inicio (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *         description: Fecha de fin (YYYY-MM-DD)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Estado de los registros
 *     responses:
 *       200:
 *         description: Reporte generado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo médicos pueden generar reportes
 *       500:
 *         description: Error interno del servidor
 */

reportRoutes.get("/appointments", generateAppointmentsReport)
reportRoutes.get("/surgeries", generateSurgeriesReport)
reportRoutes.get("/patients", generatePatientsReport)
reportRoutes.get("/financial", generateFinancialReport)

export default reportRoutes

import { Router } from "express"
import { getDemandPredictionHandler } from "../controllers/DemandPredictionController"
import { authenticate } from "../middleware/auth"

const demandPredictionRoutes: Router = Router()

demandPredictionRoutes.use(authenticate)

/**
 * @swagger
 * /api/demand-prediction:
 *   get:
 *     summary: Predicción de demandas (citas y cirugías)
 *     description: Devuelve datos históricos y predicción de demanda para los próximos 7, 14 o 30 días. Médicos ven solo sus datos; Admin puede filtrar por doctor o ver todo.
 *     tags:
 *       - Demand Prediction
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: integer
 *           enum: [7, 14, 30]
 *         description: Días a predecir (default 7)
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: string
 *         description: document_id del médico (solo Admin; opcional)
 *     responses:
 *       200:
 *         description: Datos de predicción de demandas
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 */
demandPredictionRoutes.get("/", getDemandPredictionHandler)

export default demandPredictionRoutes

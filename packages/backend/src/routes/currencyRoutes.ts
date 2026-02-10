import { Router } from "express"
import { getCurrencyRatesController } from "../controllers/CurrencyController"
import { authenticate } from "../middleware/auth"

/**
 * @swagger
 * /api/currency:
 *   get:
 *     summary: Obtener las tasas de cambio del dólar (Oficial y Paralelo)
 *     tags:
 *     - Currency
 *     responses:
 *       200:
 *         description: Tasas de cambio obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rates:
 *                   type: object
 *                   properties:
 *                     oficial:
 *                       type: object
 *                       properties:
 *                         nombre:
 *                           type: string
 *                           example: "Oficial"
 *                         promedio:
 *                           type: number
 *                           example: 382.6318
 *                         fechaActualizacion:
 *                           type: string
 *                           example: "2026-02-08T21:01:29.812Z"
 *                     paralelo:
 *                       type: object
 *                       properties:
 *                         nombre:
 *                           type: string
 *                           example: "Paralelo"
 *                         promedio:
 *                           type: number
 *                           example: 538.99
 *                         fechaActualizacion:
 *                           type: string
 *                           example: "2026-02-08T21:01:29.027Z"
 *                 message:
 *                   type: string
 *                   example: "Currency rates retrieved successfully"
 *       500:
 *         description: Error al obtener las tasas de cambio
 */

const currencyRoutes: Router = Router()

// Currency routes require authentication
currencyRoutes.use(authenticate)

// Get currency exchange rates
currencyRoutes.get("/", getCurrencyRatesController)

export default currencyRoutes

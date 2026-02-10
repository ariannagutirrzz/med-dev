import type { Request, Response } from "express"
import { getCurrencyRates } from "../services/CurrencyService"

/**
 * CurrencyController
 * Single Responsibility: Handle HTTP requests/responses for currency rates
 * Delegates business logic to CurrencyService (Dependency Inversion Principle)
 */

/**
 * Get current currency exchange rates
 * GET /api/currency
 */
export const getCurrencyRatesController = async (
	req: Request,
	res: Response,
) => {
	try {
		const rates = await getCurrencyRates()

		res.json({
			rates,
			message: "Currency rates retrieved successfully",
		})
	} catch (error) {
		console.error("Error in getCurrencyRatesController:", error)
		res.status(500).json({
			error:
				error instanceof Error ? error.message : "Internal server error",
		})
	}
}

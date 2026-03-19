import type { Request, Response } from "express"
import { getChartsStats } from "../services/ChartsStatsService.js"
import { getDemandPrediction } from "../services/DemandPredictionService.js"

const PERIODS = [7, 14, 30] as const
type Period = (typeof PERIODS)[number]

function isPeriod(n: unknown): n is Period {
	return typeof n === "number" && PERIODS.includes(n as Period)
}

/**
 * GET /api/demand-prediction
 * Query: period=7|14|30, doctorId= (optional, Admin only)
 * Returns historical + predicted demand for appointments and surgeries.
 */
export async function getDemandPredictionHandler(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		if (!req.user) {
			res.status(401).json({ error: "Unauthorized: User not found" })
			return
		}

		const { document_id: userId, role } = req.user
		if (role !== "Médico" && role !== "Admin") {
			res.status(403).json({
				error: "Solo médicos y administradores pueden acceder a la predicción de demandas.",
			})
			return
		}

		const periodParam = req.query.period
		const period: 7 | 14 | 30 = isPeriod(Number(periodParam))
			? (Number(periodParam) as 7 | 14 | 30)
			: 7
		let doctorId: string | null = null

		if (role === "Médico") {
			doctorId = userId
		} else if (role === "Admin" && typeof req.query.doctorId === "string") {
			doctorId = req.query.doctorId.trim() || null
		}

		const result = await getDemandPrediction(doctorId, period)
		res.json(result)
	} catch (error) {
		console.error("Error in demand prediction:", error)
		res.status(500).json({
			error:
				error instanceof Error ? error.message : "Internal server error",
		})
	}
}

/**
 * GET /api/demand-prediction/charts
 * Returns monthly aggregates for charts (appointments, surgeries, new patients, revenue).
 * Same auth as main demand-prediction: Médico sees own data, Admin can pass doctorId or see all.
 */
export async function getChartsStatsHandler(
	req: Request,
	res: Response,
): Promise<void> {
	try {
		if (!req.user) {
			res.status(401).json({ error: "Unauthorized: User not found" })
			return
		}

		const { document_id: userId, role } = req.user
		if (role !== "Médico" && role !== "Admin") {
			res.status(403).json({
				error: "Solo médicos y administradores pueden acceder a los gráficos.",
			})
			return
		}

		let doctorId: string | null = null
		if (role === "Médico") {
			doctorId = userId
		} else if (role === "Admin" && typeof req.query.doctorId === "string") {
			doctorId = req.query.doctorId.trim() || null
		}

		const startDate =
			typeof req.query.startDate === "string" ? req.query.startDate : undefined
		const endDate =
			typeof req.query.endDate === "string" ? req.query.endDate : undefined

		const result = await getChartsStats(doctorId, startDate, endDate)
		res.json(result)
	} catch (error) {
		console.error("Error in charts stats:", error)
		res.status(500).json({
			error:
				error instanceof Error ? error.message : "Internal server error",
		})
	}
}

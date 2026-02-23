import { api } from "../../../config/axios"

export interface DemandByDate {
	date: string
	count: number
	type: "historical" | "predicted"
}

export interface DemandSummary {
	next7Days: number
	next14Days: number
	next30Days: number
}

export type DataQuality = "low" | "medium" | "high"

export interface DemandMeta {
	totalHistorical: number
	daysWithData: number
	dataQuality: DataQuality
}

export interface DemandPredictionResult {
	appointments: {
		byDate: DemandByDate[]
		summary: DemandSummary
		meta: DemandMeta
	}
	surgeries: {
		byDate: DemandByDate[]
		summary: DemandSummary
		meta: DemandMeta
	}
	newPatients: {
		byDate: DemandByDate[]
		summary: DemandSummary
		meta: DemandMeta
	}
}

export type PredictionPeriod = 7 | 14 | 30

/**
 * Fetch demand prediction (appointments + surgeries) for the next period days.
 * For Admin, optional doctorId can be passed to filter by doctor.
 */
export async function getDemandPrediction(
	period: PredictionPeriod = 7,
	doctorId?: string,
): Promise<DemandPredictionResult> {
	const params = new URLSearchParams()
	params.set("period", String(period))
	if (doctorId) params.set("doctorId", doctorId)
	const { data } = await api.get<DemandPredictionResult>(
		`/demand-prediction?${params.toString()}`,
	)
	return data
}

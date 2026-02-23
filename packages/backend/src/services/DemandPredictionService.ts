import { query } from "../db"

const HISTORY_DAYS = 90
/** Minimum observations per weekday to trust that day's average; otherwise use overall average (better for small units). */
const MIN_WEEKDAY_SAMPLES = 3

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
	/** Predicted new patient registrations (from patients.created_at). */
	newPatients: {
		byDate: DemandByDate[]
		summary: DemandSummary
		meta: DemandMeta
	}
}

/**
 * Get historical daily counts for appointments (optionally filtered by doctor).
 */
async function getAppointmentCountsByDay(
	doctorId: string | null,
	fromDate: string,
	toDate: string,
): Promise<{ date: string; count: number }[]> {
	const result = doctorId
		? await query(
				`SELECT DATE(a.appointment_date)::text as date, COUNT(*)::int as count
       FROM appointments a
       WHERE DATE(a.appointment_date) >= $1 AND DATE(a.appointment_date) <= $2
       AND a.status = ANY(ARRAY['scheduled','completed','pending']::text[])
       AND a.doctor_id = $3
       GROUP BY DATE(a.appointment_date)
       ORDER BY date`,
				[fromDate, toDate, doctorId],
			)
		: await query(
				`SELECT DATE(a.appointment_date)::text as date, COUNT(*)::int as count
       FROM appointments a
       WHERE DATE(a.appointment_date) >= $1 AND DATE(a.appointment_date) <= $2
       AND a.status = ANY(ARRAY['scheduled','completed','pending']::text[])
       GROUP BY DATE(a.appointment_date)
       ORDER BY date`,
				[fromDate, toDate],
			)

	return result.rows.map((r) => ({ date: r.date, count: Number(r.count) }))
}

/**
 * Get historical daily counts for surgeries (optionally filtered by doctor).
 */
async function getSurgeryCountsByDay(
	doctorId: string | null,
	fromDate: string,
	toDate: string,
): Promise<{ date: string; count: number }[]> {
	const result = doctorId
		? await query(
				`SELECT DATE(s.surgery_date)::text as date, COUNT(*)::int as count
       FROM surgeries s
       WHERE DATE(s.surgery_date) >= $1 AND DATE(s.surgery_date) <= $2
       AND s.status = ANY(ARRAY['Scheduled','Completed']::text[])
       AND s.doctor_id = $3
       GROUP BY DATE(s.surgery_date)
       ORDER BY date`,
				[fromDate, toDate, doctorId],
			)
		: await query(
				`SELECT DATE(s.surgery_date)::text as date, COUNT(*)::int as count
       FROM surgeries s
       WHERE DATE(s.surgery_date) >= $1 AND DATE(s.surgery_date) <= $2
       AND s.status = ANY(ARRAY['Scheduled','Completed']::text[])
       GROUP BY DATE(s.surgery_date)
       ORDER BY date`,
				[fromDate, toDate],
			)

	return result.rows.map((r) => ({ date: r.date, count: Number(r.count) }))
}

/**
 * Get new patient registrations per day (patients.created_at). No doctor filter.
 */
async function getNewPatientCountsByDay(
	fromDate: string,
	toDate: string,
): Promise<{ date: string; count: number }[]> {
	const result = await query(
		`SELECT DATE(created_at)::text as date, COUNT(*)::int as count
     FROM patients
     WHERE DATE(created_at) >= $1 AND DATE(created_at) <= $2
     GROUP BY DATE(created_at)
     ORDER BY date`,
		[fromDate, toDate],
	)
	return result.rows.map((r) => ({ date: r.date, count: Number(r.count) }))
}

/**
 * Build prediction for next N days.
 * For small units: if a weekday has fewer than MIN_WEEKDAY_SAMPLES observations,
 * use the overall daily average instead (more stable).
 */
function predictNextDays(
	historical: { date: string; count: number }[],
	period: number,
): { byDate: DemandByDate[]; summary: DemandSummary } {
	const byWeekday: Record<number, number[]> = {
		0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
	}
	let totalCount = 0
	for (const row of historical) {
		const d = new Date(row.date + "Z")
		const dayOfWeek = d.getUTCDay()
		byWeekday[dayOfWeek].push(row.count)
		totalCount += row.count
	}

	const totalDays = historical.length
	const overallDailyAvg = totalDays > 0 ? totalCount / totalDays : 0

	const avgByWeekday: Record<number, number> = {}
	for (let w = 0; w <= 6; w++) {
		const arr = byWeekday[w]
		if (arr.length >= MIN_WEEKDAY_SAMPLES) {
			const avg = arr.reduce((a, b) => a + b, 0) / arr.length
			avgByWeekday[w] = Math.round(avg * 10) / 10
		} else {
			avgByWeekday[w] = Math.round(overallDailyAvg * 10) / 10
		}
	}

	const today = new Date()
	today.setHours(0, 0, 0, 0)
	const byDate: DemandByDate[] = []
	let next7 = 0
	let next14 = 0
	let next30 = 0

	for (let i = 1; i <= Math.max(period, 30); i++) {
		const d = new Date(today)
		d.setDate(d.getDate() + i)
		const dateStr = d.toISOString().split("T")[0]
		const weekday = d.getDay()
		const predicted = avgByWeekday[weekday] ?? 0
		if (i <= period) {
			byDate.push({ date: dateStr, count: predicted, type: "predicted" })
			if (i <= 7) next7 += predicted
			if (i <= 14) next14 += predicted
			if (i <= 30) next30 += predicted
		}
	}

	return {
		byDate,
		summary: {
			next7Days: Math.round(next7 * 10) / 10,
			next14Days: Math.round(next14 * 10) / 10,
			next30Days: Math.round(next30 * 10) / 10,
		},
	}
}

function dataQuality(totalHistorical: number, daysWithData: number): DataQuality {
	if (totalHistorical >= 50 && daysWithData >= 14) return "high"
	if (totalHistorical >= 15 || daysWithData >= 7) return "medium"
	return "low"
}

/**
 * Get demand prediction: historical daily data + predicted next period.
 * doctorId: when provided, filter by doctor; when null, use all data (e.g. Admin).
 * period: 7, 14, or 30 days to predict ahead.
 */
export async function getDemandPrediction(
	doctorId: string | null,
	period: 7 | 14 | 30,
): Promise<DemandPredictionResult> {
	const toDate = new Date()
	const fromDate = new Date()
	fromDate.setDate(fromDate.getDate() - HISTORY_DAYS)
	const fromStr = fromDate.toISOString().split("T")[0]
	const toStr = toDate.toISOString().split("T")[0]

	const [appointmentHistory, surgeryHistory, newPatientsHistory] =
		await Promise.all([
			getAppointmentCountsByDay(doctorId, fromStr, toStr),
			getSurgeryCountsByDay(doctorId, fromStr, toStr),
			getNewPatientCountsByDay(fromStr, toStr),
		])

	const appointmentHistoricalByDate: DemandByDate[] = appointmentHistory.map(
		(row) => ({
			date: row.date,
			count: row.count,
			type: "historical" as const,
		}),
	)
	const surgeryHistoricalByDate: DemandByDate[] = surgeryHistory.map((row) => ({
		date: row.date,
		count: row.count,
		type: "historical" as const,
	}))

	const appointmentPrediction = predictNextDays(appointmentHistory, period)
	const surgeryPrediction = predictNextDays(surgeryHistory, period)
	const newPatientsPrediction = predictNextDays(newPatientsHistory, period)

	const appointmentTotal = appointmentHistory.reduce((s, r) => s + r.count, 0)
	const surgeryTotal = surgeryHistory.reduce((s, r) => s + r.count, 0)
	const newPatientsTotal = newPatientsHistory.reduce((s, r) => s + r.count, 0)

	return {
		appointments: {
			byDate: [...appointmentHistoricalByDate, ...appointmentPrediction.byDate],
			summary: appointmentPrediction.summary,
			meta: {
				totalHistorical: appointmentTotal,
				daysWithData: appointmentHistory.length,
				dataQuality: dataQuality(appointmentTotal, appointmentHistory.length),
			},
		},
		surgeries: {
			byDate: [...surgeryHistoricalByDate, ...surgeryPrediction.byDate],
			summary: surgeryPrediction.summary,
			meta: {
				totalHistorical: surgeryTotal,
				daysWithData: surgeryHistory.length,
				dataQuality: dataQuality(surgeryTotal, surgeryHistory.length),
			},
		},
		newPatients: {
			byDate: [
				...newPatientsHistory.map((r) => ({
					date: r.date,
					count: r.count,
					type: "historical" as const,
				})),
				...newPatientsPrediction.byDate,
			],
			summary: newPatientsPrediction.summary,
			meta: {
				totalHistorical: newPatientsTotal,
				daysWithData: newPatientsHistory.length,
				dataQuality: dataQuality(
					newPatientsTotal,
					newPatientsHistory.length,
				),
			},
		},
	}
}

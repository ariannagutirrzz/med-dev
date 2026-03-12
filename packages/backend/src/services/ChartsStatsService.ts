import { query } from "../db"

const MONTHS_BACK = 12

export interface MonthCount {
	year: number
	month: number
	monthLabel: string
	count: number
}

export interface MonthRevenue {
	year: number
	month: number
	monthLabel: string
	revenue_usd: number
}

const MONTH_NAMES_ES = [
	"Ene", "Feb", "Mar", "Abr", "May", "Jun",
	"Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
]

function toMonthLabel(year: number, month: number): string {
	return `${MONTH_NAMES_ES[month - 1]} ${year}`
}

/**
 * Build list of last N months (year, month) ending at today for filling gaps.
 */
function getLastMonths(n: number): { year: number; month: number }[] {
	const out: { year: number; month: number }[] = []
	const d = new Date()
	for (let i = 0; i < n; i++) {
		out.push({ year: d.getFullYear(), month: d.getMonth() + 1 })
		d.setMonth(d.getMonth() - 1)
	}
	return out.reverse()
}

/**
 * Build list of months between a start and end date (inclusive, by month),
 * and the concrete date strings used for SQL filtering.
 * If no custom range is provided, falls back to the last MONTHS_BACK months.
 */
function buildMonthRange(
	customStartDate?: string,
	customEndDate?: string,
): {
	range: { year: number; month: number }[]
	startStr: string
	endStr: string
} {
	// Default behaviour: last N months
	if (!customStartDate || !customEndDate) {
		const range = getLastMonths(MONTHS_BACK)
		const start = range[0]
		const end = range[range.length - 1]
		const startStr = `${start.year}-${String(start.month).padStart(2, "0")}-01`
		const endDate = new Date(end.year, end.month, 0)
		const endStr = endDate.toISOString().split("T")[0]
		return { range, startStr, endStr }
	}

	// Custom range: build month buckets from start to end
	const startDate = new Date(customStartDate)
	const endDate = new Date(customEndDate)

	// Normalise to first of month for iteration
	const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
	const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1)

	const range: { year: number; month: number }[] = []
	// Hard cap to avoid accidental huge ranges
	while (cursor <= endMonth && range.length < 60) {
		range.push({ year: cursor.getFullYear(), month: cursor.getMonth() + 1 })
		cursor.setMonth(cursor.getMonth() + 1)
	}

	// SQL date bounds: from first day of first month to last day of last month
	const first = range[0]
	const last = range[range.length - 1]
	const startStr = `${first.year}-${String(first.month).padStart(2, "0")}-01`
	const sqlEndDate = new Date(last.year, last.month, 0)
	const endStr = sqlEndDate.toISOString().split("T")[0]

	return { range, startStr, endStr }
}

/**
 * Appointments per month (scheduled, completed, pending). Optional doctor filter and date range.
 */
export async function getAppointmentsByMonth(
	doctorId: string | null,
	startDate?: string,
	endDate?: string,
): Promise<MonthCount[]> {
	const { range, startStr, endStr } = buildMonthRange(startDate, endDate)

	const sql = doctorId
		? `SELECT DATE_TRUNC('month', a.appointment_date)::date as period,
         COUNT(*)::int as count
     FROM appointments a
     WHERE a.appointment_date >= $1::date AND a.appointment_date <= $2::date
     AND a.status = ANY(ARRAY['scheduled','completed','pending']::text[])
     AND a.doctor_id = $3
     GROUP BY DATE_TRUNC('month', a.appointment_date)
     ORDER BY period`
		: `SELECT DATE_TRUNC('month', a.appointment_date)::date as period,
         COUNT(*)::int as count
     FROM appointments a
     WHERE a.appointment_date >= $1::date AND a.appointment_date <= $2::date
     AND a.status = ANY(ARRAY['scheduled','completed','pending']::text[])
     GROUP BY DATE_TRUNC('month', a.appointment_date)
     ORDER BY period`
	const params = doctorId ? [startStr, endStr, doctorId] : [startStr, endStr]
	const result = await query(sql, params)
	const byKey = new Map<string, number>()
	for (const row of result.rows) {
		const d = new Date(row.period)
		const key = `${d.getFullYear()}-${d.getMonth() + 1}`
		byKey.set(key, Number(row.count))
	}
	return range.map(({ year, month }) => ({
		year,
		month,
		monthLabel: toMonthLabel(year, month),
		count: byKey.get(`${year}-${month}`) ?? 0,
	}))
}

/**
 * Surgeries per month (Scheduled, Completed). Optional doctor filter and date range.
 */
export async function getSurgeriesByMonth(
	doctorId: string | null,
	startDate?: string,
	endDate?: string,
): Promise<MonthCount[]> {
	const { range, startStr, endStr } = buildMonthRange(startDate, endDate)

	const sql = doctorId
		? `SELECT DATE_TRUNC('month', s.surgery_date)::date as period,
         COUNT(*)::int as count
     FROM surgeries s
     WHERE s.surgery_date >= $1::date AND s.surgery_date <= $2::date
     AND s.status = ANY(ARRAY['Scheduled','Completed']::text[])
     AND s.doctor_id = $3
     GROUP BY DATE_TRUNC('month', s.surgery_date)
     ORDER BY period`
		: `SELECT DATE_TRUNC('month', s.surgery_date)::date as period,
         COUNT(*)::int as count
     FROM surgeries s
     WHERE s.surgery_date >= $1::date AND s.surgery_date <= $2::date
     AND s.status = ANY(ARRAY['Scheduled','Completed']::text[])
     GROUP BY DATE_TRUNC('month', s.surgery_date)
     ORDER BY period`
	const params = doctorId ? [startStr, endStr, doctorId] : [startStr, endStr]
	const result = await query(sql, params)
	const byKey = new Map<string, number>()
	for (const row of result.rows) {
		const d = new Date(row.period)
		const key = `${d.getFullYear()}-${d.getMonth() + 1}`
		byKey.set(key, Number(row.count))
	}
	return range.map(({ year, month }) => ({
		year,
		month,
		monthLabel: toMonthLabel(year, month),
		count: byKey.get(`${year}-${month}`) ?? 0,
	}))
}

/**
 * New patients (patients.created_at) per month. Optional date range.
 */
export async function getNewPatientsByMonth(
	startDate?: string,
	endDate?: string,
): Promise<MonthCount[]> {
	const { range, startStr, endStr } = buildMonthRange(startDate, endDate)

	const result = await query(
		`SELECT DATE_TRUNC('month', created_at)::date as period,
       COUNT(*)::int as count
   FROM patients
   WHERE created_at >= $1::date AND created_at <= $2::date
   GROUP BY DATE_TRUNC('month', created_at)
   ORDER BY period`,
		[startStr, endStr],
	)
	const byKey = new Map<string, number>()
	for (const row of result.rows) {
		const d = new Date(row.period)
		const key = `${d.getFullYear()}-${d.getMonth() + 1}`
		byKey.set(key, Number(row.count))
	}
	return range.map(({ year, month }) => ({
		year,
		month,
		monthLabel: toMonthLabel(year, month),
		count: byKey.get(`${year}-${month}`) ?? 0,
	}))
}

/**
 * Revenue per month (appointments + surgeries with price_usd). Optional doctor filter and date range.
 */
export async function getRevenueByMonth(
	doctorId: string | null,
	startDate?: string,
	endDate?: string,
): Promise<MonthRevenue[]> {
	const { range, startStr, endStr } = buildMonthRange(startDate, endDate)

	if (doctorId) {
		const [appRes, surgRes] = await Promise.all([
			query(
				`SELECT DATE_TRUNC('month', a.appointment_date)::date as period,
         COALESCE(SUM(a.price_usd), 0)::float as total
     FROM appointments a
     WHERE a.appointment_date >= $1::date AND a.appointment_date <= $2::date
     AND a.doctor_id = $3 AND a.price_usd IS NOT NULL
     GROUP BY DATE_TRUNC('month', a.appointment_date)`,
				[startStr, endStr, doctorId],
			),
			query(
				`SELECT DATE_TRUNC('month', s.surgery_date)::date as period,
         COALESCE(SUM(s.price_usd), 0)::float as total
     FROM surgeries s
     WHERE s.surgery_date >= $1::date AND s.surgery_date <= $2::date
     AND s.doctor_id = $3 AND s.price_usd IS NOT NULL
     GROUP BY DATE_TRUNC('month', s.surgery_date)`,
				[startStr, endStr, doctorId],
			),
		])
		const byKey = new Map<string, number>()
		for (const row of appRes.rows) {
			const d = new Date(row.period)
			const key = `${d.getFullYear()}-${d.getMonth() + 1}`
			byKey.set(key, (byKey.get(key) ?? 0) + Number(row.total))
		}
		for (const row of surgRes.rows) {
			const d = new Date(row.period)
			const key = `${d.getFullYear()}-${d.getMonth() + 1}`
			byKey.set(key, (byKey.get(key) ?? 0) + Number(row.total))
		}
		return range.map(({ year, month }) => ({
			year,
			month,
			monthLabel: toMonthLabel(year, month),
			revenue_usd: byKey.get(`${year}-${month}`) ?? 0,
		}))
	}

	const [appRes, surgRes] = await Promise.all([
		query(
			`SELECT DATE_TRUNC('month', a.appointment_date)::date as period,
       COALESCE(SUM(a.price_usd), 0)::float as total
   FROM appointments a
   WHERE a.appointment_date >= $1::date AND a.appointment_date <= $2::date
   AND a.price_usd IS NOT NULL
   GROUP BY DATE_TRUNC('month', a.appointment_date)`,
			[startStr, endStr],
		),
		query(
			`SELECT DATE_TRUNC('month', s.surgery_date)::date as period,
       COALESCE(SUM(s.price_usd), 0)::float as total
   FROM surgeries s
   WHERE s.surgery_date >= $1::date AND s.surgery_date <= $2::date
   AND s.price_usd IS NOT NULL
   GROUP BY DATE_TRUNC('month', s.surgery_date)`,
			[startStr, endStr],
		),
	])
	const byKey = new Map<string, number>()
	for (const row of appRes.rows) {
		const d = new Date(row.period)
		const key = `${d.getFullYear()}-${d.getMonth() + 1}`
		byKey.set(key, (byKey.get(key) ?? 0) + Number(row.total))
	}
	for (const row of surgRes.rows) {
		const d = new Date(row.period)
		const key = `${d.getFullYear()}-${d.getMonth() + 1}`
		byKey.set(key, (byKey.get(key) ?? 0) + Number(row.total))
	}
	return range.map(({ year, month }) => ({
		year,
		month,
		monthLabel: toMonthLabel(year, month),
		revenue_usd: byKey.get(`${year}-${month}`) ?? 0,
	}))
}

export interface ChartsStatsResult {
	appointmentsByMonth: MonthCount[]
	surgeriesByMonth: MonthCount[]
	newPatientsByMonth: MonthCount[]
	revenueByMonth: MonthRevenue[]
}

export async function getChartsStats(
	doctorId: string | null,
	startDate?: string,
	endDate?: string,
): Promise<ChartsStatsResult> {
	const [appointmentsByMonth, surgeriesByMonth, newPatientsByMonth, revenueByMonth] =
		await Promise.all([
			getAppointmentsByMonth(doctorId, startDate, endDate),
			getSurgeriesByMonth(doctorId, startDate, endDate),
			getNewPatientsByMonth(startDate, endDate),
			getRevenueByMonth(doctorId, startDate, endDate),
		])
	return {
		appointmentsByMonth,
		surgeriesByMonth,
		newPatientsByMonth,
		revenueByMonth,
	}
}

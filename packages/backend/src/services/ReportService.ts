import { query } from "../db"

export interface ReportFilters {
	startDate?: string
	endDate?: string
	doctorId?: string
	status?: string
}

export interface AppointmentReportData {
	id: number
	patient_name: string
	doctor_name: string
	appointment_date: string
	status: string
	notes: string | null
	service_name: string | null
	price_usd: number | null
	created_at: string
}

export interface SurgeryReportData {
	id: number
	patient_name: string
	doctor_name: string
	surgery_date: string
	surgery_type: string
	status: string
	notes: string | null
	service_name: string | null
	price_usd: number | null
	created_at: string
}

export interface PatientReportData {
	document_id: string
	first_name: string
	last_name: string
	email: string | null
	phone: string | null
	birthdate: string | null
	gender: string | null
	address: string | null
	total_appointments: number
	total_surgeries: number
	created_at: string
}

export interface FinancialReportData {
	date: string
	type: "appointment" | "surgery"
	patient_name: string
	service_name: string
	price_usd: number
	status: string
}

/**
 * Get appointments report data
 */
export async function getAppointmentsReport(
	doctorId: string,
	filters: ReportFilters = {},
): Promise<AppointmentReportData[]> {
	try {
		let whereClause = "WHERE a.doctor_id = $1"
		const params: any[] = [doctorId]
		let paramIndex = 2

		if (filters.startDate) {
			whereClause += ` AND a.appointment_date >= $${paramIndex}`
			params.push(filters.startDate)
			paramIndex++
		}

		if (filters.endDate) {
			whereClause += ` AND a.appointment_date <= $${paramIndex}`
			params.push(filters.endDate)
			paramIndex++
		}

		if (filters.status) {
			whereClause += ` AND a.status = $${paramIndex}`
			params.push(filters.status)
			paramIndex++
		}

		const result = await query(
			`SELECT 
				a.id,
				COALESCE(u.name, CONCAT(p.first_name, ' ', p.last_name)) as patient_name,
				doc.name as doctor_name,
				a.appointment_date,
				a.status,
				a.notes,
				st.name as service_name,
				a.price_usd,
				TO_CHAR(a.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at
			FROM appointments a
			LEFT JOIN users u ON a.patient_id = u.document_id
			LEFT JOIN patients p ON a.patient_id = p.document_id
			LEFT JOIN users doc ON a.doctor_id = doc.document_id
			LEFT JOIN doctor_services ds ON a.service_id = ds.id
			LEFT JOIN service_types st ON ds.service_type_id = st.id
			${whereClause}
			ORDER BY a.appointment_date DESC`,
			params,
		)

		return result.rows as AppointmentReportData[]
	} catch (error) {
		console.error("Error fetching appointments report:", error)
		throw new Error("Failed to fetch appointments report")
	}
}

/**
 * Get surgeries report data
 */
export async function getSurgeriesReport(
	doctorId: string,
	filters: ReportFilters = {},
): Promise<SurgeryReportData[]> {
	try {
		let whereClause = "WHERE s.doctor_id = $1"
		const params: any[] = [doctorId]
		let paramIndex = 2

		if (filters.startDate) {
			whereClause += ` AND s.surgery_date >= $${paramIndex}`
			params.push(filters.startDate)
			paramIndex++
		}

		if (filters.endDate) {
			whereClause += ` AND s.surgery_date <= $${paramIndex}`
			params.push(filters.endDate)
			paramIndex++
		}

		if (filters.status) {
			whereClause += ` AND s.status = $${paramIndex}`
			params.push(filters.status)
			paramIndex++
		}

		const result = await query(
			`SELECT 
				s.id,
				CONCAT(p.first_name, ' ', p.last_name) as patient_name,
				u.name as doctor_name,
				s.surgery_date,
				s.surgery_type,
				s.status,
				s.notes,
				st.name as service_name,
				s.price_usd,
				TO_CHAR(s.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at
			FROM surgeries s
			LEFT JOIN patients p ON s.patient_id = p.document_id
			LEFT JOIN users u ON s.doctor_id = u.document_id
			LEFT JOIN doctor_services ds ON s.service_id = ds.id
			LEFT JOIN service_types st ON ds.service_type_id = st.id
			${whereClause}
			ORDER BY s.surgery_date DESC`,
			params,
		)

		return result.rows as SurgeryReportData[]
	} catch (error) {
		console.error("Error fetching surgeries report:", error)
		throw new Error("Failed to fetch surgeries report")
	}
}

/**
 * Get patients report data
 */
export async function getPatientsReport(
	doctorId: string,
): Promise<PatientReportData[]> {
	try {
		const result = await query(
			`SELECT 
				p.document_id,
				p.first_name,
				p.last_name,
				p.email,
				p.phone,
				p.birthdate,
				p.gender,
				p.address,
				COUNT(DISTINCT a.id) as total_appointments,
				COUNT(DISTINCT s.id) as total_surgeries,
				TO_CHAR(p.created_at, 'YYYY-MM-DD') as created_at
			FROM patients p
			LEFT JOIN appointments a ON a.patient_id = p.document_id AND a.doctor_id = $1
			LEFT JOIN surgeries s ON s.patient_id = p.document_id AND s.doctor_id = $1
			WHERE EXISTS (
				SELECT 1 FROM medical_records mr 
				WHERE mr.patient_id = p.document_id AND mr.doctor_id = $1
			)
			OR EXISTS (
				SELECT 1 FROM appointments a2 
				WHERE a2.patient_id = p.document_id AND a2.doctor_id = $1
			)
			OR EXISTS (
				SELECT 1 FROM surgeries s2 
				WHERE s2.patient_id = p.document_id AND s2.doctor_id = $1
			)
			GROUP BY p.document_id, p.first_name, p.last_name, p.email, p.phone, p.birthdate, p.gender, p.address, p.created_at
			ORDER BY p.last_name ASC, p.first_name ASC`,
			[doctorId],
		)

		return result.rows.map((row) => ({
			...row,
			total_appointments: parseInt(row.total_appointments, 10),
			total_surgeries: parseInt(row.total_surgeries, 10),
		})) as PatientReportData[]
	} catch (error) {
		console.error("Error fetching patients report:", error)
		throw new Error("Failed to fetch patients report")
	}
}

/**
 * Get financial report data (appointments + surgeries with prices)
 */
export async function getFinancialReport(
	doctorId: string,
	filters: ReportFilters = {},
): Promise<FinancialReportData[]> {
	try {
		// Better approach: separate queries and combine
		const appointmentParams: any[] = [doctorId]
		let appointmentWhere = "WHERE a.doctor_id = $1 AND a.price_usd IS NOT NULL"
		let appointmentParamIndex = 2

		if (filters.startDate) {
			appointmentWhere += ` AND a.appointment_date >= $${appointmentParamIndex}`
			appointmentParams.push(filters.startDate)
			appointmentParamIndex++
		}

		if (filters.endDate) {
			appointmentWhere += ` AND a.appointment_date <= $${appointmentParamIndex}`
			appointmentParams.push(filters.endDate)
			appointmentParamIndex++
		}

		if (filters.status) {
			appointmentWhere += ` AND a.status = $${appointmentParamIndex}`
			appointmentParams.push(filters.status)
			appointmentParamIndex++
		}

		const appointmentsResult = await query(
			`SELECT 
				a.appointment_date::text as date,
				'appointment' as type,
				COALESCE(u.name, CONCAT(p.first_name, ' ', p.last_name)) as patient_name,
				st.name as service_name,
				a.price_usd,
				a.status
			FROM appointments a
			LEFT JOIN users u ON a.patient_id = u.document_id
			LEFT JOIN patients p ON a.patient_id = p.document_id
			LEFT JOIN doctor_services ds ON a.service_id = ds.id
			LEFT JOIN service_types st ON ds.service_type_id = st.id
			${appointmentWhere}
			ORDER BY a.appointment_date DESC`,
			appointmentParams,
		)

		const surgeryParams: any[] = [doctorId]
		let surgeryWhere = "WHERE s.doctor_id = $1 AND s.price_usd IS NOT NULL"
		let surgeryParamIndex = 2

		if (filters.startDate) {
			surgeryWhere += ` AND s.surgery_date >= $${surgeryParamIndex}`
			surgeryParams.push(filters.startDate)
			surgeryParamIndex++
		}

		if (filters.endDate) {
			surgeryWhere += ` AND s.surgery_date <= $${surgeryParamIndex}`
			surgeryParams.push(filters.endDate)
			surgeryParamIndex++
		}

		if (filters.status) {
			surgeryWhere += ` AND s.status = $${surgeryParamIndex}`
			surgeryParams.push(filters.status)
			surgeryParamIndex++
		}

		const surgeriesResult = await query(
			`SELECT 
				s.surgery_date::text as date,
				'surgery' as type,
				CONCAT(p.first_name, ' ', p.last_name) as patient_name,
				st.name as service_name,
				s.price_usd,
				s.status
			FROM surgeries s
			LEFT JOIN patients p ON s.patient_id = p.document_id
			LEFT JOIN doctor_services ds ON s.service_id = ds.id
			LEFT JOIN service_types st ON ds.service_type_id = st.id
			${surgeryWhere}
			ORDER BY s.surgery_date DESC`,
			surgeryParams,
		)

		const combined = [
			...appointmentsResult.rows.map((row) => ({
				date: row.date,
				type: "appointment" as const,
				patient_name: row.patient_name,
				service_name: row.service_name,
				price_usd: parseFloat(row.price_usd),
				status: row.status,
			})),
			...surgeriesResult.rows.map((row) => ({
				date: row.date,
				type: "surgery" as const,
				patient_name: row.patient_name,
				service_name: row.service_name,
				price_usd: parseFloat(row.price_usd),
				status: row.status,
			})),
		].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

		return combined as FinancialReportData[]
	} catch (error) {
		console.error("Error fetching financial report:", error)
		throw new Error("Failed to fetch financial report")
	}
}

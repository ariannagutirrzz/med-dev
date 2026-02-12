import { api } from "../../../config/axios"

export interface ReportFilters {
	startDate?: string
	endDate?: string
	status?: string
}

/**
 * Generate appointments report
 */
export async function generateAppointmentsReport(
	format: "pdf" | "excel",
	filters: ReportFilters = {},
): Promise<Blob> {
	try {
		const params = new URLSearchParams()
		params.append("format", format)
		if (filters.startDate) params.append("startDate", filters.startDate)
		if (filters.endDate) params.append("endDate", filters.endDate)
		if (filters.status) params.append("status", filters.status)

		const response = await api.get(`/reports/appointments?${params.toString()}`, {
			responseType: "blob",
		})

		return response.data
	} catch (error) {
		console.error("Error generating appointments report:", error)
		throw new Error("Failed to generate appointments report")
	}
}

/**
 * Generate surgeries report
 */
export async function generateSurgeriesReport(
	format: "pdf" | "excel",
	filters: ReportFilters = {},
): Promise<Blob> {
	try {
		const params = new URLSearchParams()
		params.append("format", format)
		if (filters.startDate) params.append("startDate", filters.startDate)
		if (filters.endDate) params.append("endDate", filters.endDate)
		if (filters.status) params.append("status", filters.status)

		const response = await api.get(`/reports/surgeries?${params.toString()}`, {
			responseType: "blob",
		})

		return response.data
	} catch (error) {
		console.error("Error generating surgeries report:", error)
		throw new Error("Failed to generate surgeries report")
	}
}

/**
 * Generate patients report
 */
export async function generatePatientsReport(
	format: "pdf" | "excel",
): Promise<Blob> {
	try {
		const params = new URLSearchParams()
		params.append("format", format)

		const response = await api.get(`/reports/patients?${params.toString()}`, {
			responseType: "blob",
		})

		return response.data
	} catch (error) {
		console.error("Error generating patients report:", error)
		throw new Error("Failed to generate patients report")
	}
}

/**
 * Generate financial report
 */
export async function generateFinancialReport(
	format: "pdf" | "excel",
	filters: ReportFilters = {},
): Promise<Blob> {
	try {
		const params = new URLSearchParams()
		params.append("format", format)
		if (filters.startDate) params.append("startDate", filters.startDate)
		if (filters.endDate) params.append("endDate", filters.endDate)
		if (filters.status) params.append("status", filters.status)

		const response = await api.get(`/reports/financial?${params.toString()}`, {
			responseType: "blob",
		})

		return response.data
	} catch (error) {
		console.error("Error generating financial report:", error)
		throw new Error("Failed to generate financial report")
	}
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
	const url = window.URL.createObjectURL(blob)
	const link = document.createElement("a")
	link.href = url
	link.download = filename
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
	window.URL.revokeObjectURL(url)
}

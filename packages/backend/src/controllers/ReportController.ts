import type { Request, Response } from "express"
import {
	getAppointmentsReport,
	getFinancialReport,
	getPatientsReport,
	getSurgeriesReport,
	type ReportFilters,
} from "../services/ReportService"
import {
	generateAppointmentsExcel,
	generateAppointmentsPDF,
	generateFinancialExcel,
	generateFinancialPDF,
	generatePatientsExcel,
	generatePatientsPDF,
	generateSurgeriesExcel,
	generateSurgeriesPDF,
} from "../utils/reportGenerators"

/**
 * Generate appointments report (PDF or Excel)
 */
export const generateAppointmentsReport = async (
	req: Request,
	res: Response,
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: "Unauthorized: User not found" })
		}

		const { document_id: userId, role } = req.user

		if (role !== "Médico") {
			return res.status(403).json({
				error: "Only doctors can generate reports",
			})
		}

		const { format = "pdf", startDate, endDate, status } = req.query
		const filters: ReportFilters = {
			startDate: startDate as string,
			endDate: endDate as string,
			status: status as string,
		}

		const data = await getAppointmentsReport(userId, filters)

		if (format === "excel") {
			const buffer = await generateAppointmentsExcel(data, filters)
			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			)
			res.setHeader(
				"Content-Disposition",
				`attachment; filename=reporte-citas-${new Date().toISOString().split("T")[0]}.xlsx`,
			)
			res.send(buffer)
		} else {
			const buffer = await generateAppointmentsPDF(data, filters)
			res.setHeader("Content-Type", "application/pdf")
			res.setHeader(
				"Content-Disposition",
				`attachment; filename=reporte-citas-${new Date().toISOString().split("T")[0]}.pdf`,
			)
			res.send(buffer)
		}
	} catch (error) {
		console.error("Error generating appointments report:", error)
		res.status(500).json({
			error: error instanceof Error ? error.message : "Internal server error",
		})
	}
}

/**
 * Generate surgeries report (PDF or Excel)
 */
export const generateSurgeriesReport = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: "Unauthorized: User not found" })
		}

		const { document_id: userId, role } = req.user

		if (role !== "Médico") {
			return res.status(403).json({
				error: "Only doctors can generate reports",
			})
		}

		const { format = "pdf", startDate, endDate, status } = req.query
		const filters: ReportFilters = {
			startDate: startDate as string,
			endDate: endDate as string,
			status: status as string,
		}

		const data = await getSurgeriesReport(userId, filters)

		if (format === "excel") {
			const buffer = await generateSurgeriesExcel(data, filters)
			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			)
			res.setHeader(
				"Content-Disposition",
				`attachment; filename=reporte-cirugias-${new Date().toISOString().split("T")[0]}.xlsx`,
			)
			res.send(buffer)
		} else {
			const buffer = await generateSurgeriesPDF(data, filters)
			res.setHeader("Content-Type", "application/pdf")
			res.setHeader(
				"Content-Disposition",
				`attachment; filename=reporte-cirugias-${new Date().toISOString().split("T")[0]}.pdf`,
			)
			res.send(buffer)
		}
	} catch (error) {
		console.error("Error generating surgeries report:", error)
		res.status(500).json({
			error: error instanceof Error ? error.message : "Internal server error",
		})
	}
}

/**
 * Generate patients report (PDF or Excel)
 */
export const generatePatientsReport = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: "Unauthorized: User not found" })
		}

		const { document_id: userId, role } = req.user

		if (role !== "Médico") {
			return res.status(403).json({
				error: "Only doctors can generate reports",
			})
		}

		const { format = "pdf" } = req.query

		const data = await getPatientsReport(userId)

		if (format === "excel") {
			const buffer = await generatePatientsExcel(data)
			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			)
			res.setHeader(
				"Content-Disposition",
				`attachment; filename=reporte-pacientes-${new Date().toISOString().split("T")[0]}.xlsx`,
			)
			res.send(buffer)
		} else {
			const buffer = await generatePatientsPDF(data)
			res.setHeader("Content-Type", "application/pdf")
			res.setHeader(
				"Content-Disposition",
				`attachment; filename=reporte-pacientes-${new Date().toISOString().split("T")[0]}.pdf`,
			)
			res.send(buffer)
		}
	} catch (error) {
		console.error("Error generating patients report:", error)
		res.status(500).json({
			error: error instanceof Error ? error.message : "Internal server error",
		})
	}
}

/**
 * Generate financial report (PDF or Excel)
 */
export const generateFinancialReport = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: "Unauthorized: User not found" })
		}

		const { document_id: userId, role } = req.user

		if (role !== "Médico") {
			return res.status(403).json({
				error: "Only doctors can generate reports",
			})
		}

		const { format = "pdf", startDate, endDate, status } = req.query
		const filters: ReportFilters = {
			startDate: startDate as string,
			endDate: endDate as string,
			status: status as string,
		}

		const data = await getFinancialReport(userId, filters)

		if (format === "excel") {
			const buffer = await generateFinancialExcel(data, filters)
			res.setHeader(
				"Content-Type",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			)
			res.setHeader(
				"Content-Disposition",
				`attachment; filename=reporte-financiero-${new Date().toISOString().split("T")[0]}.xlsx`,
			)
			res.send(buffer)
		} else {
			const buffer = await generateFinancialPDF(data, filters)
			res.setHeader("Content-Type", "application/pdf")
			res.setHeader(
				"Content-Disposition",
				`attachment; filename=reporte-financiero-${new Date().toISOString().split("T")[0]}.pdf`,
			)
			res.send(buffer)
		}
	} catch (error) {
		console.error("Error generating financial report:", error)
		res.status(500).json({
			error: error instanceof Error ? error.message : "Internal server error",
		})
	}
}

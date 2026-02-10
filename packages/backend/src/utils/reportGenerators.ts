import PDFDocument from "pdfkit"
import ExcelJS from "exceljs"
import type {
	AppointmentReportData,
	FinancialReportData,
	PatientReportData,
	SurgeryReportData,
} from "../services/ReportService"

/**
 * Generate PDF report for appointments
 */
export function generateAppointmentsPDF(
	data: AppointmentReportData[],
	filters: { startDate?: string; endDate?: string; status?: string },
): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		try {
			const doc = new PDFDocument({ margin: 50 })
			const chunks: Buffer[] = []

			doc.on("data", (chunk) => chunks.push(chunk))
			doc.on("end", () => resolve(Buffer.concat(chunks)))
			doc.on("error", reject)

			// Header
			doc.fontSize(20).text("Reporte de Citas Médicas", { align: "center" })
			doc.moveDown()

			// Filters info
			if (filters.startDate || filters.endDate || filters.status) {
				doc.fontSize(10).text("Filtros aplicados:", { underline: true })
				if (filters.startDate) {
					doc.text(`Fecha inicio: ${filters.startDate}`)
				}
				if (filters.endDate) {
					doc.text(`Fecha fin: ${filters.endDate}`)
				}
				if (filters.status) {
					doc.text(`Estado: ${filters.status}`)
				}
				doc.moveDown()
			}

			// Table header
			const tableTop = doc.y
			const rowHeight = 20
			const colWidths = [50, 100, 100, 100, 80, 150]

			doc.fontSize(10).font("Helvetica-Bold")
			doc.text("ID", 50, tableTop)
			doc.text("Paciente", 100, tableTop)
			doc.text("Médico", 200, tableTop)
			doc.text("Fecha", 300, tableTop)
			doc.text("Estado", 400, tableTop)
			doc.text("Servicio", 480, tableTop)
			doc.text("Precio USD", 580, tableTop)

			// Table rows
			doc.font("Helvetica").fontSize(9)
			let y = tableTop + rowHeight

			data.forEach((row, index) => {
				if (y > 750) {
					// New page
					doc.addPage()
					y = 50
				}

				doc.text(row.id.toString(), 50, y)
				doc.text(row.patient_name || "N/A", 100, y, { width: 100 })
				doc.text(row.doctor_name || "N/A", 200, y, { width: 100 })
				doc.text(
					new Date(row.appointment_date).toLocaleDateString("es-ES"),
					300,
					y,
					{ width: 100 },
				)
				doc.text(row.status, 400, y, { width: 80 })
				doc.text(row.service_name || "N/A", 480, y, { width: 100 })
				doc.text(
					row.price_usd
						? `$${Number(row.price_usd).toFixed(2)}`
						: "N/A",
					580,
					y,
					{ width: 100 },
				)

				y += rowHeight
			})

			// Summary
			doc.moveDown(2)
			doc.fontSize(12).font("Helvetica-Bold")
			doc.text(`Total de citas: ${data.length}`, { align: "left" })
			const totalRevenue = data.reduce(
				(sum, row) => sum + (Number(row.price_usd) || 0),
				0,
			)
			if (totalRevenue > 0) {
				doc.text(`Ingresos totales: $${totalRevenue.toFixed(2)} USD`, {
					align: "left",
				})
			}

			doc.end()
		} catch (error) {
			reject(error)
		}
	})
}

/**
 * Generate Excel report for appointments
 */
export async function generateAppointmentsExcel(
	data: AppointmentReportData[],
	filters: { startDate?: string; endDate?: string; status?: string },
): Promise<Buffer> {
	const workbook = new ExcelJS.Workbook()
	const worksheet = workbook.addWorksheet("Reporte de Citas")

	// Header
	worksheet.mergeCells("A1:G1")
	worksheet.getCell("A1").value = "Reporte de Citas Médicas"
	worksheet.getCell("A1").font = { size: 16, bold: true }
	worksheet.getCell("A1").alignment = { horizontal: "center" }

	// Filters
	let filterRow = 3
	if (filters.startDate || filters.endDate || filters.status) {
		worksheet.getCell(`A${filterRow}`).value = "Filtros aplicados:"
		worksheet.getCell(`A${filterRow}`).font = { bold: true }
		filterRow++
		if (filters.startDate) {
			worksheet.getCell(`A${filterRow}`).value = `Fecha inicio: ${filters.startDate}`
			filterRow++
		}
		if (filters.endDate) {
			worksheet.getCell(`A${filterRow}`).value = `Fecha fin: ${filters.endDate}`
			filterRow++
		}
		if (filters.status) {
			worksheet.getCell(`A${filterRow}`).value = `Estado: ${filters.status}`
			filterRow++
		}
		filterRow++
	}

	// Table headers
	const headerRow = filterRow
	worksheet.getRow(headerRow).values = [
		"ID",
		"Paciente",
		"Médico",
		"Fecha",
		"Estado",
		"Servicio",
		"Precio USD",
		"Notas",
	]
	worksheet.getRow(headerRow).font = { bold: true }
	worksheet.getRow(headerRow).fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFE0E0E0" },
	}

	// Data rows
		data.forEach((row) => {
			const dataRow = worksheet.addRow([
				row.id,
				row.patient_name || "N/A",
				row.doctor_name || "N/A",
				new Date(row.appointment_date).toLocaleDateString("es-ES"),
				row.status,
				row.service_name || "N/A",
				Number(row.price_usd) || 0,
				row.notes || "",
			])
			dataRow.getCell(7).numFmt = "$#,##0.00" // Format price
		})

	// Auto-fit columns
	worksheet.columns.forEach((column) => {
		column.width = 15
	})

	// Summary
		const summaryRow = worksheet.addRow([])
		summaryRow.getCell(1).value = `Total de citas: ${data.length}`
		summaryRow.getCell(1).font = { bold: true }
		const totalRevenue = data.reduce(
			(sum, row) => sum + (Number(row.price_usd) || 0),
			0,
		)
	if (totalRevenue > 0) {
		const revenueRow = worksheet.addRow([])
		revenueRow.getCell(1).value = `Ingresos totales: $${totalRevenue.toFixed(2)} USD`
		revenueRow.getCell(1).font = { bold: true }
	}

	const buffer = await workbook.xlsx.writeBuffer()
	return Buffer.from(buffer)
}

/**
 * Generate PDF report for surgeries
 */
export function generateSurgeriesPDF(
	data: SurgeryReportData[],
	filters: { startDate?: string; endDate?: string; status?: string },
): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		try {
			const doc = new PDFDocument({ margin: 50 })
			const chunks: Buffer[] = []

			doc.on("data", (chunk) => chunks.push(chunk))
			doc.on("end", () => resolve(Buffer.concat(chunks)))
			doc.on("error", reject)

			// Header
			doc.fontSize(20).text("Reporte de Cirugías", { align: "center" })
			doc.moveDown()

			// Filters info
			if (filters.startDate || filters.endDate || filters.status) {
				doc.fontSize(10).text("Filtros aplicados:", { underline: true })
				if (filters.startDate) {
					doc.text(`Fecha inicio: ${filters.startDate}`)
				}
				if (filters.endDate) {
					doc.text(`Fecha fin: ${filters.endDate}`)
				}
				if (filters.status) {
					doc.text(`Estado: ${filters.status}`)
				}
				doc.moveDown()
			}

			// Table header
			const tableTop = doc.y
			const rowHeight = 20

			doc.fontSize(10).font("Helvetica-Bold")
			doc.text("ID", 50, tableTop)
			doc.text("Paciente", 100, tableTop)
			doc.text("Médico", 200, tableTop)
			doc.text("Fecha", 300, tableTop)
			doc.text("Tipo", 400, tableTop)
			doc.text("Estado", 480, tableTop)
			doc.text("Servicio", 550, tableTop)
			doc.text("Precio USD", 650, tableTop)

			// Table rows
			doc.font("Helvetica").fontSize(9)
			let y = tableTop + rowHeight

			data.forEach((row) => {
				if (y > 750) {
					doc.addPage()
					y = 50
				}

				doc.text(row.id.toString(), 50, y)
				doc.text(row.patient_name || "N/A", 100, y, { width: 100 })
				doc.text(row.doctor_name || "N/A", 200, y, { width: 100 })
				doc.text(
					new Date(row.surgery_date).toLocaleDateString("es-ES"),
					300,
					y,
					{ width: 100 },
				)
				doc.text(row.surgery_type || "N/A", 400, y, { width: 80 })
				doc.text(row.status, 480, y, { width: 80 })
				doc.text(row.service_name || "N/A", 550, y, { width: 100 })
				doc.text(
					row.price_usd
						? `$${Number(row.price_usd).toFixed(2)}`
						: "N/A",
					650,
					y,
					{ width: 100 },
				)

				y += rowHeight
			})

			// Summary
			doc.moveDown(2)
			doc.fontSize(12).font("Helvetica-Bold")
			doc.text(`Total de cirugías: ${data.length}`, { align: "left" })
			const totalRevenue = data.reduce(
				(sum, row) => sum + (Number(row.price_usd) || 0),
				0,
			)
			if (totalRevenue > 0) {
				doc.text(`Ingresos totales: $${totalRevenue.toFixed(2)} USD`, {
					align: "left",
				})
			}

			doc.end()
		} catch (error) {
			reject(error)
		}
	})
}

/**
 * Generate Excel report for surgeries
 */
export async function generateSurgeriesExcel(
	data: SurgeryReportData[],
	filters: { startDate?: string; endDate?: string; status?: string },
): Promise<Buffer> {
	const workbook = new ExcelJS.Workbook()
	const worksheet = workbook.addWorksheet("Reporte de Cirugías")

	// Header
	worksheet.mergeCells("A1:H1")
	worksheet.getCell("A1").value = "Reporte de Cirugías"
	worksheet.getCell("A1").font = { size: 16, bold: true }
	worksheet.getCell("A1").alignment = { horizontal: "center" }

	// Filters
	let filterRow = 3
	if (filters.startDate || filters.endDate || filters.status) {
		worksheet.getCell(`A${filterRow}`).value = "Filtros aplicados:"
		worksheet.getCell(`A${filterRow}`).font = { bold: true }
		filterRow++
		if (filters.startDate) {
			worksheet.getCell(`A${filterRow}`).value = `Fecha inicio: ${filters.startDate}`
			filterRow++
		}
		if (filters.endDate) {
			worksheet.getCell(`A${filterRow}`).value = `Fecha fin: ${filters.endDate}`
			filterRow++
		}
		if (filters.status) {
			worksheet.getCell(`A${filterRow}`).value = `Estado: ${filters.status}`
			filterRow++
		}
		filterRow++
	}

	// Table headers
	const headerRow = filterRow
	worksheet.getRow(headerRow).values = [
		"ID",
		"Paciente",
		"Médico",
		"Fecha",
		"Tipo",
		"Estado",
		"Servicio",
		"Precio USD",
		"Notas",
	]
	worksheet.getRow(headerRow).font = { bold: true }
	worksheet.getRow(headerRow).fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFE0E0E0" },
	}

	// Data rows
		data.forEach((row) => {
			const dataRow = worksheet.addRow([
				row.id,
				row.patient_name || "N/A",
				row.doctor_name || "N/A",
				new Date(row.surgery_date).toLocaleDateString("es-ES"),
				row.surgery_type || "N/A",
				row.status,
				row.service_name || "N/A",
				Number(row.price_usd) || 0,
				row.notes || "",
			])
			dataRow.getCell(8).numFmt = "$#,##0.00" // Format price
		})

	// Auto-fit columns
	worksheet.columns.forEach((column) => {
		column.width = 15
	})

	// Summary
		const summaryRow = worksheet.addRow([])
		summaryRow.getCell(1).value = `Total de cirugías: ${data.length}`
		summaryRow.getCell(1).font = { bold: true }
		const totalRevenue = data.reduce(
			(sum, row) => sum + (Number(row.price_usd) || 0),
			0,
		)
	if (totalRevenue > 0) {
		const revenueRow = worksheet.addRow([])
		revenueRow.getCell(1).value = `Ingresos totales: $${totalRevenue.toFixed(2)} USD`
		revenueRow.getCell(1).font = { bold: true }
	}

	const buffer = await workbook.xlsx.writeBuffer()
	return Buffer.from(buffer)
}

/**
 * Generate PDF report for patients
 */
export function generatePatientsPDF(data: PatientReportData[]): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		try {
			const doc = new PDFDocument({ margin: 50 })
			const chunks: Buffer[] = []

			doc.on("data", (chunk) => chunks.push(chunk))
			doc.on("end", () => resolve(Buffer.concat(chunks)))
			doc.on("error", reject)

			// Header
			doc.fontSize(20).text("Reporte de Pacientes", { align: "center" })
			doc.moveDown()

			// Table header
			const tableTop = doc.y
			const rowHeight = 20

			doc.fontSize(10).font("Helvetica-Bold")
			doc.text("Cédula", 50, tableTop)
			doc.text("Nombre", 150, tableTop)
			doc.text("Email", 280, tableTop)
			doc.text("Teléfono", 400, tableTop)
			doc.text("Citas", 500, tableTop)
			doc.text("Cirugías", 550, tableTop)

			// Table rows
			doc.font("Helvetica").fontSize(9)
			let y = tableTop + rowHeight

			data.forEach((row) => {
				if (y > 750) {
					doc.addPage()
					y = 50
				}

				doc.text(row.document_id, 50, y)
				doc.text(`${row.first_name} ${row.last_name}`, 150, y, { width: 130 })
				doc.text(row.email || "N/A", 280, y, { width: 120 })
				doc.text(row.phone || "N/A", 400, y, { width: 100 })
				doc.text(row.total_appointments.toString(), 500, y)
				doc.text(row.total_surgeries.toString(), 550, y)

				y += rowHeight
			})

			// Summary
			doc.moveDown(2)
			doc.fontSize(12).font("Helvetica-Bold")
			doc.text(`Total de pacientes: ${data.length}`, { align: "left" })

			doc.end()
		} catch (error) {
			reject(error)
		}
	})
}

/**
 * Generate Excel report for patients
 */
export async function generatePatientsExcel(
	data: PatientReportData[],
): Promise<Buffer> {
	const workbook = new ExcelJS.Workbook()
	const worksheet = workbook.addWorksheet("Reporte de Pacientes")

	// Header
	worksheet.mergeCells("A1:G1")
	worksheet.getCell("A1").value = "Reporte de Pacientes"
	worksheet.getCell("A1").font = { size: 16, bold: true }
	worksheet.getCell("A1").alignment = { horizontal: "center" }

	// Table headers
	const headerRow = 3
	worksheet.getRow(headerRow).values = [
		"Cédula",
		"Nombre",
		"Apellido",
		"Email",
		"Teléfono",
		"Total Citas",
		"Total Cirugías",
	]
	worksheet.getRow(headerRow).font = { bold: true }
	worksheet.getRow(headerRow).fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFE0E0E0" },
	}

	// Data rows
	data.forEach((row) => {
		worksheet.addRow([
			row.document_id,
			row.first_name,
			row.last_name,
			row.email || "",
			row.phone || "",
			row.total_appointments,
			row.total_surgeries,
		])
	})

	// Auto-fit columns
	worksheet.columns.forEach((column) => {
		column.width = 15
	})

	// Summary
	const summaryRow = worksheet.addRow([])
	summaryRow.getCell(1).value = `Total de pacientes: ${data.length}`
	summaryRow.getCell(1).font = { bold: true }

	const buffer = await workbook.xlsx.writeBuffer()
	return Buffer.from(buffer)
}

/**
 * Generate PDF report for financial data
 */
export function generateFinancialPDF(
	data: FinancialReportData[],
	filters: { startDate?: string; endDate?: string; status?: string },
): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		try {
			const doc = new PDFDocument({ margin: 50 })
			const chunks: Buffer[] = []

			doc.on("data", (chunk) => chunks.push(chunk))
			doc.on("end", () => resolve(Buffer.concat(chunks)))
			doc.on("error", reject)

			// Header
			doc.fontSize(20).text("Reporte Financiero", { align: "center" })
			doc.moveDown()

			// Filters info
			if (filters.startDate || filters.endDate || filters.status) {
				doc.fontSize(10).text("Filtros aplicados:", { underline: true })
				if (filters.startDate) {
					doc.text(`Fecha inicio: ${filters.startDate}`)
				}
				if (filters.endDate) {
					doc.text(`Fecha fin: ${filters.endDate}`)
				}
				if (filters.status) {
					doc.text(`Estado: ${filters.status}`)
				}
				doc.moveDown()
			}

			// Table header
			const tableTop = doc.y
			const rowHeight = 20

			doc.fontSize(10).font("Helvetica-Bold")
			doc.text("Fecha", 50, tableTop)
			doc.text("Tipo", 120, tableTop)
			doc.text("Paciente", 180, tableTop)
			doc.text("Servicio", 320, tableTop)
			doc.text("Precio USD", 450, tableTop)
			doc.text("Estado", 550, tableTop)

			// Table rows
			doc.font("Helvetica").fontSize(9)
			let y = tableTop + rowHeight

			data.forEach((row) => {
				if (y > 750) {
					doc.addPage()
					y = 50
				}

				doc.text(
					new Date(row.date).toLocaleDateString("es-ES"),
					50,
					y,
					{ width: 70 },
				)
				doc.text(row.type === "appointment" ? "Cita" : "Cirugía", 120, y, {
					width: 60,
				})
				doc.text(row.patient_name || "N/A", 180, y, { width: 140 })
				doc.text(row.service_name || "N/A", 320, y, { width: 130 })
				doc.text(
					`$${Number(row.price_usd).toFixed(2)}`,
					450,
					y,
					{ width: 100 },
				)
				doc.text(row.status, 550, y, { width: 80 })

				y += rowHeight
			})

			// Summary
			doc.moveDown(2)
			doc.fontSize(12).font("Helvetica-Bold")
			doc.text(`Total de registros: ${data.length}`, { align: "left" })
			const totalRevenue = data.reduce(
				(sum, row) => sum + Number(row.price_usd),
				0,
			)
			doc.text(`Ingresos totales: $${totalRevenue.toFixed(2)} USD`, {
				align: "left",
			})

			doc.end()
		} catch (error) {
			reject(error)
		}
	})
}

/**
 * Generate Excel report for financial data
 */
export async function generateFinancialExcel(
	data: FinancialReportData[],
	filters: { startDate?: string; endDate?: string; status?: string },
): Promise<Buffer> {
	const workbook = new ExcelJS.Workbook()
	const worksheet = workbook.addWorksheet("Reporte Financiero")

	// Header
	worksheet.mergeCells("A1:F1")
	worksheet.getCell("A1").value = "Reporte Financiero"
	worksheet.getCell("A1").font = { size: 16, bold: true }
	worksheet.getCell("A1").alignment = { horizontal: "center" }

	// Filters
	let filterRow = 3
	if (filters.startDate || filters.endDate || filters.status) {
		worksheet.getCell(`A${filterRow}`).value = "Filtros aplicados:"
		worksheet.getCell(`A${filterRow}`).font = { bold: true }
		filterRow++
		if (filters.startDate) {
			worksheet.getCell(`A${filterRow}`).value = `Fecha inicio: ${filters.startDate}`
			filterRow++
		}
		if (filters.endDate) {
			worksheet.getCell(`A${filterRow}`).value = `Fecha fin: ${filters.endDate}`
			filterRow++
		}
		if (filters.status) {
			worksheet.getCell(`A${filterRow}`).value = `Estado: ${filters.status}`
			filterRow++
		}
		filterRow++
	}

	// Table headers
	const headerRow = filterRow
	worksheet.getRow(headerRow).values = [
		"Fecha",
		"Tipo",
		"Paciente",
		"Servicio",
		"Precio USD",
		"Estado",
	]
	worksheet.getRow(headerRow).font = { bold: true }
	worksheet.getRow(headerRow).fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FFE0E0E0" },
	}

	// Data rows
		data.forEach((row) => {
			const dataRow = worksheet.addRow([
				new Date(row.date).toLocaleDateString("es-ES"),
				row.type === "appointment" ? "Cita" : "Cirugía",
				row.patient_name || "N/A",
				row.service_name || "N/A",
				Number(row.price_usd),
				row.status,
			])
			dataRow.getCell(5).numFmt = "$#,##0.00" // Format price
		})

	// Auto-fit columns
	worksheet.columns.forEach((column) => {
		column.width = 15
	})

	// Summary
		const summaryRow = worksheet.addRow([])
		summaryRow.getCell(1).value = `Total de registros: ${data.length}`
		summaryRow.getCell(1).font = { bold: true }
		const totalRevenue = data.reduce(
			(sum, row) => sum + Number(row.price_usd),
			0,
		)
	const revenueRow = worksheet.addRow([])
	revenueRow.getCell(1).value = `Ingresos totales: $${totalRevenue.toFixed(2)} USD`
	revenueRow.getCell(1).font = { bold: true }

	const buffer = await workbook.xlsx.writeBuffer()
	return Buffer.from(buffer)
}

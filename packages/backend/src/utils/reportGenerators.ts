import ExcelJS from "exceljs"
import PDFDocument from "pdfkit-table"
import type {
	AppointmentReportData,
	FinancialReportData,
	InventoryReportData,
	PatientReportData,
	SurgeryReportData,
} from "../services/ReportService"

/**
 * Generate PDF report for appointments
 */
export async function generateAppointmentsPDF(
	data: AppointmentReportData[],
	filters: { startDate?: string; endDate?: string; status?: string },
): Promise<Buffer> {
	const doc = new PDFDocument({
		margin: 30,
		size: "A4",
		layout: "landscape",
	})

	const chunks: Buffer[] = []
	const bufferPromise = new Promise<Buffer>((resolve, reject) => {
		doc.on("data", (chunk) => chunks.push(chunk))
		doc.on("end", () => resolve(Buffer.concat(chunks)))
		doc.on("error", reject)
	})

	try {
		// Cabecera
		doc
			.fontSize(20)
			.font("Helvetica-Bold")
			.text("Reporte de Citas Médicas", { align: "center" })
		doc.moveDown()

		// Información de Filtros
		if (filters.startDate || filters.endDate || filters.status) {
			doc
				.fontSize(10)
				.font("Helvetica-Bold")
				.text("Filtros aplicados:", { underline: true })
			doc.font("Helvetica").fontSize(9)
			if (filters.startDate) doc.text(`Fecha inicio: ${filters.startDate}`)
			if (filters.endDate) doc.text(`Fecha fin: ${filters.endDate}`)
			if (filters.status) doc.text(`Estado: ${filters.status}`)
			doc.moveDown()
		}

		// Configuración de la Tabla
		const tableData = {
			headers: [
				{ label: "ID", property: "id", width: 40 },
				{ label: "Paciente", property: "patient", width: 150 },
				{ label: "Médico", property: "doctor", width: 120 },
				{ label: "Fecha", property: "date", width: 80 },
				{ label: "Estado", property: "status", width: 80 },
				{ label: "Servicio", property: "service", width: 150 },
				{ label: "Precio USD", property: "price", width: 80 },
			],
			datas: data.map((row) => ({
				id: row.id.toString(),
				patient: row.patient_name || "N/A",
				doctor: row.doctor_name || "N/A",
				date: new Date(row.appointment_date).toLocaleDateString("es-ES"),
				status: (row.status || "").toUpperCase(),
				service: row.service_name || "N/A",
				price: row.price_usd ? `$${Number(row.price_usd).toFixed(2)}` : "$0.00",
			})),
		}

		// Renderizar tabla
		await (doc as PDFDocument).table(tableData, {
			prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
			prepareRow: () => doc.font("Helvetica").fontSize(9),
		})

		// --- SECCIÓN DE RESUMEN (REINTEGRADA) ---
		doc.moveDown(1.5) // Espacio después de la tabla

		// Línea divisoria para el resumen
		const currentY = doc.y
		doc.moveTo(30, currentY).lineTo(790, currentY).stroke()
		doc.moveDown(0.5)

		// Cálculo de totales
		const totalAppointments = data.length
		const totalRevenue = data.reduce(
			(sum, row) => sum + (Number(row.price_usd) || 0),
			0,
		)

		doc.fontSize(12).font("Helvetica-Bold")
		doc.text(`Total de citas: ${totalAppointments}`, { align: "left" })

		if (totalRevenue > 0) {
			doc
				.fillColor("#2d5a27") // Un tono verde oscuro para el ingreso
				.text(`Ingresos totales: $${totalRevenue.toFixed(2)} USD`, {
					align: "left",
				})
				.fillColor("black") // Resetear color
		}
		// ---------------------------------------

		doc.end()
		return await bufferPromise
	} catch (error) {
		doc.end()
		throw error
	}
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
			worksheet.getCell(`A${filterRow}`).value =
				`Fecha inicio: ${filters.startDate}`
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
		revenueRow.getCell(1).value =
			`Ingresos totales: $${totalRevenue.toFixed(2)} USD`
		revenueRow.getCell(1).font = { bold: true }
	}

	const buffer = await workbook.xlsx.writeBuffer()
	return Buffer.from(buffer)
}

/**
 * Generate PDF report for surgeries
 */
export async function generateSurgeriesPDF(
	data: SurgeryReportData[],
	filters: { startDate?: string; endDate?: string; status?: string },
): Promise<Buffer> {
	// 1. Configuración del documento (Landscape para acomodar todas las columnas)
	const doc = new PDFDocument({
		margin: 30,
		size: "A4",
		layout: "landscape",
	})

	const chunks: Buffer[] = []

	// Promesa para capturar el Buffer final
	const bufferPromise = new Promise<Buffer>((resolve, reject) => {
		doc.on("data", (chunk) => chunks.push(chunk))
		doc.on("end", () => resolve(Buffer.concat(chunks)))
		doc.on("error", reject)
	})

	try {
		// Cabecera del Reporte
		doc
			.fontSize(20)
			.font("Helvetica-Bold")
			.text("Reporte de Cirugías", { align: "center" })
		doc.moveDown()

		// Información de Filtros
		if (filters.startDate || filters.endDate || filters.status) {
			doc
				.fontSize(10)
				.font("Helvetica-Bold")
				.text("Filtros aplicados:", { underline: true })
			doc.font("Helvetica").fontSize(9)
			if (filters.startDate) doc.text(`Fecha inicio: ${filters.startDate}`)
			if (filters.endDate) doc.text(`Fecha fin: ${filters.endDate}`)
			if (filters.status) doc.text(`Estado: ${filters.status}`)
			doc.moveDown()
		}

		// 2. Configuración de la Tabla de Cirugías
		const tableData = {
			title: "Detalle de Procedimientos Quirúrgicos",
			headers: [
				{ label: "ID", property: "id", width: 40 },
				{ label: "Paciente", property: "patient", width: 130 },
				{ label: "Médico", property: "doctor", width: 120 },
				{ label: "Fecha", property: "date", width: 70 },
				{ label: "Tipo", property: "type", width: 90 },
				{ label: "Estado", property: "status", width: 80 },
				{ label: "Servicio", property: "service", width: 130 },
				{ label: "Precio USD", property: "price", width: 70 },
			],
			datas: data.map((row) => ({
				id: row.id.toString(),
				patient: row.patient_name || "N/A",
				doctor: row.doctor_name || "N/A",
				date: new Date(row.surgery_date).toLocaleDateString("es-ES"),
				type: row.surgery_type || "N/A",
				status: (row.status || "").toUpperCase(),
				service: row.service_name || "N/A",
				price: row.price_usd ? `$${Number(row.price_usd).toFixed(2)}` : "$0.00",
			})),
		}

		// Renderizado asíncrono de la tabla
		await (doc as any).table(tableData, {
			prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
			prepareRow: () => doc.font("Helvetica").fontSize(9),
		})

		// 3. Sección de Resumen Financiero
		doc.moveDown(1.5)

		// Línea divisoria
		const currentY = doc.y
		doc.moveTo(30, currentY).lineTo(790, currentY).stroke()
		doc.moveDown(0.5)

		// Cálculos
		const totalSurgeries = data.length
		const totalRevenue = data.reduce(
			(sum, row) => sum + (Number(row.price_usd) || 0),
			0,
		)

		doc.fontSize(12).font("Helvetica-Bold")
		doc.text(`Total de cirugías: ${totalSurgeries}`, { align: "left" })

		if (totalRevenue > 0) {
			doc
				.fillColor("#1a4d80") // Azul oscuro para diferenciarlo de las citas
				.text(`Ingresos totales: $${totalRevenue.toFixed(2)} USD`, {
					align: "left",
				})
				.fillColor("black")
		}

		// Finalizar el documento
		doc.end()

		// Retornar el buffer una vez completado
		return await bufferPromise
	} catch (error) {
		doc.end()
		throw error
	}
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
			worksheet.getCell(`A${filterRow}`).value =
				`Fecha inicio: ${filters.startDate}`
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
		revenueRow.getCell(1).value =
			`Ingresos totales: $${totalRevenue.toFixed(2)} USD`
		revenueRow.getCell(1).font = { bold: true }
	}

	const buffer = await workbook.xlsx.writeBuffer()
	return Buffer.from(buffer)
}

/**
 * Generate PDF report for patients
 */
export async function generatePatientsPDF(
	data: PatientReportData[],
): Promise<Buffer> {
	const doc = new PDFDocument({ margin: 30, size: "A4" })
	const chunks: Buffer[] = []

	const bufferPromise = new Promise<Buffer>((resolve, reject) => {
		doc.on("data", (chunk) => chunks.push(chunk))
		doc.on("end", () => resolve(Buffer.concat(chunks)))
		doc.on("error", reject)
	})

	try {
		// Encabezado
		doc
			.fontSize(20)
			.font("Helvetica-Bold")
			.text("Reporte de Pacientes", { align: "center" })
		doc.moveDown()

		// Configuración de la Tabla
		const tableData = {
			title: "Listado Maestro de Pacientes",
			headers: [
				{ label: "Cédula", property: "document_id", width: 80 },
				{ label: "Nombre Completo", property: "name", width: 150 },
				{ label: "Email", property: "email", width: 130 },
				{ label: "Teléfono", property: "phone", width: 90 },
				{ label: "Citas", property: "appointments", width: 45 },
				{ label: "Cirugías", property: "surgeries", width: 45 },
			],
			datas: data.map((row) => ({
				document_id: row.document_id,
				name: `${row.first_name} ${row.last_name}`,
				email: row.email || "N/A",
				phone: row.phone || "N/A",
				appointments: row.total_appointments.toString(),
				surgeries: row.total_surgeries.toString(),
			})),
		}

		// Renderizado de tabla
		await (doc as PDFDocument).table(tableData, {
			prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
			prepareRow: () => doc.font("Helvetica").fontSize(9),
		})

		// Resumen Final
		doc.moveDown()
		doc
			.fontSize(12)
			.font("Helvetica-Bold")
			.text(`Total de pacientes registrados: ${data.length}`)

		doc.end()
		return await bufferPromise
	} catch (error) {
		doc.end()
		throw error
	}
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
export async function generateFinancialPDF(
	data: FinancialReportData[],
	filters: { startDate?: string; endDate?: string; status?: string },
): Promise<Buffer> {
	// Usamos Landscape para reportes financieros para mayor claridad en las cifras
	const doc = new PDFDocument({
		margin: 30,
		size: "A4",
		layout: "landscape",
	})

	const chunks: Buffer[] = []
	const bufferPromise = new Promise<Buffer>((resolve, reject) => {
		doc.on("data", (chunk) => chunks.push(chunk))
		doc.on("end", () => resolve(Buffer.concat(chunks)))
		doc.on("error", reject)
	})

	try {
		// Cabecera Principal
		doc
			.fontSize(22)
			.font("Helvetica-Bold")
			.text("Reporte Financiero de Ingresos", { align: "center" })
		doc
			.fontSize(10)
			.font("Helvetica")
			.text("Consolidado de Citas y Cirugías", { align: "center" })
		doc.moveDown()

		// Bloque de Filtros
		if (filters.startDate || filters.endDate || filters.status) {
			doc
				.fontSize(10)
				.font("Helvetica-Bold")
				.text("Parámetros del reporte:", { underline: true })
			doc.font("Helvetica").fontSize(9)
			if (filters.startDate) doc.text(`Desde: ${filters.startDate}`)
			if (filters.endDate) doc.text(`Hasta: ${filters.endDate}`)
			if (filters.status)
				doc.text(`Estado de pago: ${filters.status.toUpperCase()}`)
			doc.moveDown()
		}

		// Definición de la Tabla Financiera
		const tableData = {
			title: "Desglose de Transacciones",
			headers: [
				{ label: "Fecha", property: "date", width: 80 },
				{ label: "Tipo", property: "type", width: 80 },
				{ label: "Paciente", property: "patient", width: 180 },
				{ label: "Servicio/Procedimiento", property: "service", width: 230 },
				{ label: "Estado", property: "status", width: 80 },
				{ label: "Monto USD", property: "price", width: 90 },
			],
			datas: data.map((row) => ({
				date: new Date(row.date).toLocaleDateString("es-ES"),
				type: row.type === "appointment" ? "CITA" : "CIRUGÍA",
				patient: row.patient_name || "N/A",
				service: row.service_name || "N/A",
				status: (row.status || "N/A").toUpperCase(),
				price: `$ ${Number(row.price_usd).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
			})),
		}

		// Renderizado automático
		await (doc as PDFDocument).table(tableData, {
			prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
			prepareRow: () => doc.font("Helvetica").fontSize(9),
		})

		// Sección de Totales
		doc.moveDown(1.5)
		const totalRevenue = data.reduce(
			(sum, row) => sum + Number(row.price_usd),
			0,
		)

		// Dibujar un recuadro de resumen
		const summaryY = doc.y
		doc
			.rect(30, summaryY, 250, 60)
			.strokeColor("#eeeeee")
			.fillAndStroke("#f9f9f9", "#cccccc")

		doc.fillColor("#000000").font("Helvetica-Bold").fontSize(11)
		doc.text("RESUMEN GENERAL", 40, summaryY + 10)

		doc.fontSize(10).font("Helvetica")
		doc.text(`Total de registros: ${data.length}`, 40, summaryY + 25)

		doc.fontSize(12).font("Helvetica-Bold").fillColor("#2e7d32") // Color verde éxito
		doc.text(
			`TOTAL NETO: $${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD`,
			40,
			summaryY + 40,
		)

		doc.end()
		return await bufferPromise
	} catch (error) {
		doc.end()
		throw error
	}
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
			worksheet.getCell(`A${filterRow}`).value =
				`Fecha inicio: ${filters.startDate}`
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
	const totalRevenue = data.reduce((sum, row) => sum + Number(row.price_usd), 0)
	const revenueRow = worksheet.addRow([])
	revenueRow.getCell(1).value =
		`Ingresos totales: $${totalRevenue.toFixed(2)} USD`
	revenueRow.getCell(1).font = { bold: true }

	const buffer = await workbook.xlsx.writeBuffer()
	return Buffer.from(buffer)
}

/**
 * Generate PDF report for inventory
 */
export async function generateInventoryPDF(
	data: InventoryReportData[],
	filters: { status?: string },
): Promise<Buffer> {
	const doc = new PDFDocument({
		margin: 30,
		size: "A4",
		layout: "portrait", // El inventario suele caber bien en vertical
	})

	const chunks: Buffer[] = []
	const bufferPromise = new Promise<Buffer>((resolve, reject) => {
		doc.on("data", (chunk) => chunks.push(chunk))
		doc.on("end", () => resolve(Buffer.concat(chunks)))
		doc.on("error", reject)
	})

	try {
		// Cabecera
		doc
			.fontSize(20)
			.font("Helvetica-Bold")
			.text("Reporte de Inventario de Insumos", { align: "center" })
		doc.moveDown()

		// Filtros
		if (filters.status) {
			doc
				.fontSize(10)
				.font("Helvetica-Bold")
				.text(`Filtro de estado: ${filters.status.toUpperCase()}`, {
					underline: true,
				})
			doc.moveDown()
		}

		// Configuración de la Tabla
		const tableData = {
			headers: [
				{ label: "Producto", property: "name", width: 180 },
				{ label: "Categoría", property: "category", width: 100 },
				{ label: "Cant.", property: "quantity", width: 60 },
				{ label: "Mín.", property: "min_stock", width: 60 },
				{ label: "Unidad", property: "unit", width: 70 },
				{ label: "Estado", property: "status", width: 80 },
			],
			datas: data.map((row) => ({
				name: row.name,
				category: row.category,
				quantity: row.quantity.toString(),
				min_stock: row.min_stock.toString(),
				unit: row.unit || "unidad",
				status:
					row.status === "available"
						? "Disponible"
						: row.status === "low stock"
							? "Cantidad baja"
							: "Agotado",
			})),
		}

		// Renderizar tabla con lógica de color para el estado
		await (doc as any).table(tableData, {
			prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
			prepareRow: (row: any, index: number, column: any, value: any) => {
				doc.font("Helvetica").fontSize(9).fillColor("black")
				// Si la columna es 'status' y no es 'OK', pintar en rojo
				if (column.property === "status" && value !== "available") {
					doc.fillColor("#e63946").font("Helvetica-Bold")
				}
				return doc
			},
		})

		// Resumen Final
		doc.moveDown(2).fillColor("black")
		const totalItems = data.length
		const lowStockItems = data.filter((i) => i.status !== "available").length

		doc.fontSize(12).font("Helvetica-Bold").text("Resumen de Almacén:")
		doc.fontSize(10).font("Helvetica").text(`Total de artículos: ${totalItems}`)

		if (lowStockItems > 0) {
			doc
				.fillColor("#e63946")
				.text(`Artículos en alerta (Bajo/Agotado): ${lowStockItems}`)
		} else {
			doc
				.fillColor("#2d5a27")
				.text("Todos los artículos tienen stock suficiente.")
		}

		doc.end()
		return await bufferPromise
	} catch (error) {
		doc.end()
		throw error
	}
}

/**
 * Generate Excel report for inventory
 */
export async function generateInventoryExcel(
	data: InventoryReportData[],
	filters: { status?: string },
): Promise<Buffer> {
	const workbook = new ExcelJS.Workbook()
	const worksheet = workbook.addWorksheet("Inventario")

	// Título
	worksheet.mergeCells("A1:F1")
	worksheet.getCell("A1").value = "Reporte de Inventario de Insumos Médicos"
	worksheet.getCell("A1").font = { size: 16, bold: true }
	worksheet.getCell("A1").alignment = { horizontal: "center" }

	// Table headers
	const headerRow = 3
	worksheet.getRow(headerRow).values = [
		"Producto",
		"Categoría",
		"Stock Actual",
		"Stock Mínimo",
		"Unidad",
		"Estado",
		"Última Actualización",
	]

	worksheet.getRow(headerRow).font = { bold: true, color: { argb: "FFFFFFFF" } }
	worksheet.getRow(headerRow).fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "FF2D5A27" }, // Verde institucional
	}

	// Data rows
	data.forEach((row) => {
		const dataRow = worksheet.addRow([
			row.name,
			row.category,
			row.quantity,
			row.min_stock,
			row.unit,
			row.status.toUpperCase(),
			row.last_updated,
		])

		// Formato condicional básico: si el stock es bajo, resaltar la celda de Estado
		const statusCell = dataRow.getCell(6)
		if (row.status !== "available") {
			statusCell.font = { bold: true, color: { argb: "FFFF0000" } }
		}
	})

	// Auto-ajuste de columnas
	worksheet.columns.forEach((column) => {
		column.width = 20
	})

	const buffer = await workbook.xlsx.writeBuffer()
	return Buffer.from(buffer)
}

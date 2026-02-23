import { DatePicker, Select } from "antd"
import type { Dayjs } from "dayjs"
import dayjs from "dayjs"
import "dayjs/locale/es"
import { useState } from "react"
import {
	FaCalendarAlt,
	FaDownload,
	FaFileExcel,
	FaFilePdf,
} from "react-icons/fa"
import { toast } from "react-toastify"
import { Button } from "../../../shared"
import {
	downloadBlob,
	generateAppointmentsReport,
	generateFinancialReport,
	generateInventoryReport,
	generatePatientsReport,
	generateSurgeriesReport,
	type ReportFilters,
} from "../services/ReportsAPI"

type ReportType =
	| "appointments"
	| "surgeries"
	| "patients"
	| "financial"
	| "inventory"
type ReportFormat = "pdf" | "excel"

dayjs.locale("es")

const ReportsSection = () => {
	const [selectedReport, setSelectedReport] =
		useState<ReportType>("appointments")
	const [format, setFormat] = useState<ReportFormat>("pdf")
	const [loading, setLoading] = useState(false)
	const [filters, setFilters] = useState<ReportFilters>({
		startDate: "",
		endDate: "",
		status: "",
	})

	const handleGenerateReport = async () => {
		setLoading(true)
		try {
			let blob: Blob
			let filename: string

			const dateStr = new Date().toISOString().split("T")[0]

			switch (selectedReport) {
				case "appointments":
					blob = await generateAppointmentsReport(format, filters)
					filename = `reporte-citas-${dateStr}.${format === "pdf" ? "pdf" : "xlsx"}`
					break
				case "surgeries":
					blob = await generateSurgeriesReport(format, filters)
					filename = `reporte-cirugias-${dateStr}.${format === "pdf" ? "pdf" : "xlsx"}`
					break
				case "patients":
					blob = await generatePatientsReport(format)
					filename = `reporte-pacientes-${dateStr}.${format === "pdf" ? "pdf" : "xlsx"}`
					break
				case "financial":
					blob = await generateFinancialReport(format, filters)
					filename = `reporte-financiero-${dateStr}.${format === "pdf" ? "pdf" : "xlsx"}`
					break
				case "inventory":
					blob = await generateInventoryReport(format, filters)
					filename = `reporte-inventario-${dateStr}.${format === "pdf" ? "pdf" : "xlsx"}`
					break
			}

			downloadBlob(blob, filename)
			toast.success(`Reporte generado exitosamente: ${filename}`)
		} catch (error) {
			console.error("Error generating report:", error)
			toast.error(
				error instanceof Error ? error.message : "Error al generar el reporte",
			)
		} finally {
			setLoading(false)
		}
	}

	const reportOptions = [
		{
			value: "appointments" as ReportType,
			label: "Reporte de Citas",
			description: "Lista de todas las citas médicas con detalles",
		},
		{
			value: "surgeries" as ReportType,
			label: "Reporte de Cirugías",
			description: "Lista de todas las cirugías programadas",
		},
		{
			value: "patients" as ReportType,
			label: "Reporte de Pacientes",
			description: "Lista de pacientes con estadísticas",
		},
		{
			value: "financial" as ReportType,
			label: "Reporte Financiero",
			description: "Ingresos por servicios (citas y cirugías)",
		},
		{
			value: "inventory" as ReportType,
			label: "Reporte de Inventario",
			description:
				"Estado de stock, insumos médicos y alertas de reabastecimiento",
		},
	]

	const showDateFilters =
		selectedReport !== "patients" && selectedReport !== "inventory"
	const showStatusFilter =
		selectedReport === "appointments" ||
		selectedReport === "surgeries" ||
		selectedReport === "financial" ||
		selectedReport === "inventory"

	return (
		<div className="p-6">
			<div className="mb-4">
				<h1 className="text-2xl font-bold text-gray-800 mb-1">Reportes</h1>
				<p className="text-sm text-gray-600">
					Genera y descarga reportes en formato PDF o Excel
				</p>
			</div>

			<div className="bg-white rounded-xl shadow-lg p-4">
				{/* Report Type Selection */}
				<div className="mb-4">
					<h3 className="block text-xs font-medium text-gray-700 mb-2">
						Tipo de Reporte
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
						{reportOptions.map((option) => (
							<button
								key={option.value}
								type="button"
								onClick={() => setSelectedReport(option.value)}
								className={`w-full min-h-[3.5rem] p-3 rounded-lg border text-left transition-colors cursor-pointer flex flex-col ${
									selectedReport === option.value
										? "border-primary bg-primary/5"
										: "border-gray-200 hover:border-gray-300 bg-white"
								}`}
							>
								<div className="flex flex-col items-start gap-0.5 flex-1">
									<h3 className="text-sm font-semibold text-gray-800">
										{option.label}
									</h3>
									<p className="text-xs text-gray-600">{option.description}</p>
								</div>
							</button>
						))}
					</div>
				</div>

				{/* Format Selection */}
				<div className="mb-4">
					<h3 className="block text-xs font-medium text-gray-700 mb-2">
						Formato
					</h3>
					<div className="flex gap-3">
						<Button
							type="button"
							size="middle"
							variant={format === "pdf" ? "primary" : "default"}
							onClick={() => setFormat("pdf")}
							icon={<FaFilePdf className="w-4 h-4" />}
							className={`!min-h-0 !text-sm ${
								format === "pdf"
									? "!border !border-primary"
									: "!border !border-gray-300 text-gray-700 hover:!border-gray-400"
							}`}
						>
							PDF
						</Button>
						<Button
							type="button"
							size="middle"
							variant={format === "excel" ? "primary" : "default"}
							onClick={() => setFormat("excel")}
							icon={<FaFileExcel className="w-4 h-4" />}
							className={`!min-h-0 !text-sm ${
								format === "excel"
									? "!border !border-primary"
									: "!border !border-gray-300 text-gray-700 hover:!border-gray-400"
							}`}
						>
							Excel
						</Button>
					</div>
				</div>

				{/* Filters */}
				{(showDateFilters || showStatusFilter) && (
					<div className="mb-4 p-3 bg-gray-50 rounded-lg">
						<h3 className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-2">
							<FaCalendarAlt className="text-xs" /> Filtros (Opcional)
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
							{showDateFilters && (
								<>
									<div>
										<label
											htmlFor="start_date"
											className="block text-xs font-medium text-gray-600 mb-1"
										>
											Fecha Inicio
										</label>
										<DatePicker
											id="start_date"
											size="middle"
											value={
												filters.startDate
													? dayjs(filters.startDate)
													: null
											}
											onChange={(date: Dayjs | null) =>
												setFilters({
													...filters,
													startDate: date ? date.format("YYYY-MM-DD") : "",
												})
											}
											format="DD/MM/YYYY"
											className="w-full"
											placeholder="Seleccionar fecha"
											disabledDate={(current) =>
												current && current < dayjs().startOf("day")
											}
										/>
									</div>
									<div>
										<label
											htmlFor="end_date"
											className="block text-xs font-medium text-gray-600 mb-1"
										>
											Fecha Fin
										</label>
										<DatePicker
											id="end_date"
											size="middle"
											value={
												filters.endDate ? dayjs(filters.endDate) : null
											}
											onChange={(date: Dayjs | null) =>
												setFilters({
													...filters,
													endDate: date ? date.format("YYYY-MM-DD") : "",
												})
											}
											format="DD/MM/YYYY"
											className="w-full"
											placeholder="Seleccionar fecha"
											disabledDate={(current) => {
												if (!filters.startDate) return false
												return (
													current != null &&
													current < dayjs(filters.startDate).startOf("day")
												)
											}}
										/>
									</div>
								</>
							)}
							{showStatusFilter && (
								<div>
									<label
										htmlFor="status"
										className="block text-xs font-medium text-gray-600 mb-1"
									>
										Estado
									</label>
									<Select
										id="status"
										size="middle"
										value={filters.status || undefined}
										onChange={(value) =>
											setFilters({ ...filters, status: value ?? "" })
										}
										className="w-full"
										placeholder="Todos"
										allowClear
										options={[
											{ value: "", label: "Todos" },
											...(selectedReport === "appointments"
												? [
														{ value: "pending", label: "Pendiente" },
														{ value: "scheduled", label: "Programada" },
														{ value: "completed", label: "Completada" },
														{ value: "cancelled", label: "Cancelada" },
													]
												: selectedReport === "surgeries"
													? [
															{ value: "Scheduled", label: "Programada" },
															{ value: "Completed", label: "Completada" },
															{ value: "Cancelled", label: "Cancelada" },
														]
													: selectedReport === "financial"
														? [
																{ value: "completed", label: "Completada" },
																{ value: "scheduled", label: "Programada" },
																{ value: "Cancelled", label: "Cancelada" },
															]
														: selectedReport === "inventory"
															? [
																	{
																		value: "available",
																		label: "Stock Suficiente",
																	},
																	{
																		value: "low stock",
																		label: "Stock Bajo (Alerta)",
																	},
																	{ value: "out of stock", label: "Agotado" },
																]
															: []),
										]}
									/>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Generate Button */}
				<Button
					type="button"
					size="middle"
					onClick={handleGenerateReport}
					disabled={loading}
					loading={loading}
					icon={<FaDownload className="w-4 h-4" />}
					block
					className="!min-h-0 !px-4 !py-2 !rounded-lg !text-sm"
				>
					Generar y Descargar Reporte
				</Button>
			</div>
		</div>
	)
}

export default ReportsSection

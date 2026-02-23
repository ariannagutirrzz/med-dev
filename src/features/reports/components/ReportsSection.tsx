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
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-gray-800 mb-2">Reportes</h1>
				<p className="text-gray-600">
					Genera y descarga reportes en formato PDF o Excel
				</p>
			</div>

			<div className="bg-white rounded-2xl shadow-lg p-6">
				{/* Report Type Selection */}
				<div className="mb-6">
					<h3 className="block text-sm font-medium text-gray-700 mb-3">
						Tipo de Reporte
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{reportOptions.map((option) => (
							<Button
								key={option.value}
								type="button"
								variant="default"
								onClick={() => setSelectedReport(option.value)}
								className={`!p-4 !h-auto !border-2 !rounded-xl text-left block ${
									selectedReport === option.value
										? "!border-primary !bg-primary/5"
										: "!border-gray-200 hover:!border-gray-300"
								}`}
							>
								<h3 className="font-semibold text-gray-800 mb-1">
									{option.label}
								</h3>
								<p className="text-sm text-gray-600">{option.description}</p>
							</Button>
						))}
					</div>
				</div>

				{/* Format Selection */}
				<div className="mb-6">
					<h3 className="block text-sm font-medium text-gray-700 mb-3">
						Formato
					</h3>
					<div className="flex gap-4">
						<Button
							type="button"
							variant={format === "pdf" ? "primary" : "default"}
							onClick={() => setFormat("pdf")}
							icon={<FaFilePdf className="w-5 h-5" />}
							className={
								format === "pdf"
									? "!border-2 !border-primary"
									: "!border-2 !border-gray-300 text-gray-700 hover:!border-gray-400"
							}
						>
							PDF
						</Button>
						<Button
							type="button"
							variant={format === "excel" ? "primary" : "default"}
							onClick={() => setFormat("excel")}
							icon={<FaFileExcel className="w-5 h-5" />}
							className={
								format === "excel"
									? "!border-2 !border-primary"
									: "!border-2 !border-gray-300 text-gray-700 hover:!border-gray-400"
							}
						>
							Excel
						</Button>
					</div>
				</div>

				{/* Filters */}
				{(showDateFilters || showStatusFilter) && (
					<div className="mb-6 p-4 bg-gray-50 rounded-xl">
						<h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
							<FaCalendarAlt /> Filtros (Opcional)
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{showDateFilters && (
								<>
									<div>
										<label
											htmlFor="start_date"
											className="block text-xs font-medium text-gray-600 mb-1"
										>
											Fecha Inicio
										</label>
										<input
											id="start_date"
											type="date"
											value={filters.startDate}
											onChange={(e) =>
												setFilters({ ...filters, startDate: e.target.value })
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
										/>
									</div>
									<div>
										<label
											htmlFor="end_date"
											className="block text-xs font-medium text-gray-600 mb-1"
										>
											Fecha Fin
										</label>
										<input
											id="end_date"
											type="date"
											value={filters.endDate}
											onChange={(e) =>
												setFilters({ ...filters, endDate: e.target.value })
											}
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
									<select
										id="status"
										value={filters.status}
										onChange={(e) =>
											setFilters({ ...filters, status: e.target.value })
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
									>
										<option value="">Todos</option>
										{selectedReport === "appointments" && (
											<>
												<option value="pending">Pendiente</option>
												<option value="scheduled">Programada</option>
												<option value="completed">Completada</option>
												<option value="cancelled">Cancelada</option>
											</>
										)}
										{selectedReport === "surgeries" && (
											<>
												<option value="Scheduled">Programada</option>
												<option value="Completed">Completada</option>
												<option value="Cancelled">Cancelada</option>
											</>
										)}
										{selectedReport === "financial" && (
											<>
												<option value="completed">Completada</option>
												<option value="scheduled">Programada</option>
												<option value="Cancelled">Cancelada</option>
											</>
										)}
										{selectedReport === "inventory" && (
											<>
												<option value="available">Stock Suficiente</option>
												<option value="low stock">Stock Bajo (Alerta)</option>
												<option value="out of stock">Agotado</option>
											</>
										)}
									</select>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Generate Button */}
				<Button
					type="button"
					onClick={handleGenerateReport}
					disabled={loading}
					loading={loading}
					icon={<FaDownload className="w-5 h-5" />}
					block
					className="!px-6 !py-3 !rounded-xl"
				>
					Generar y Descargar Reporte
				</Button>
			</div>
		</div>
	)
}

export default ReportsSection

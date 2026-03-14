import { DatePicker } from "antd"
import dayjs, { type Dayjs } from "dayjs"
import { useCallback, useEffect, useState } from "react"
import { FaChartBar } from "react-icons/fa"
import { toast } from "react-toastify"
import {
	type MonthCount,
	type MonthRevenue,
	getChartsStats,
} from "../services/DemandPredictionAPI"
import { BarChartCard } from "./BarChartCard"

const { RangePicker } = DatePicker

type ChartKey = "appointments" | "surgeries" | "newPatients" | "revenue"

interface ChartsSectionProps {
	doctorId?: string | null
}

function formatCurrency(n: number): string {
	return new Intl.NumberFormat("es-VE", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(n)
}

const defaultRange = { start: "", end: "" }

const ChartsSection = ({ doctorId }: ChartsSectionProps) => {
	const [ranges, setRanges] = useState<Record<ChartKey, { start: string; end: string }>>({
		appointments: { ...defaultRange },
		surgeries: { ...defaultRange },
		newPatients: { ...defaultRange },
		revenue: { ...defaultRange },
	})
	const [data, setData] = useState<{
		appointments: MonthCount[] | null
		surgeries: MonthCount[] | null
		newPatients: MonthCount[] | null
		revenue: MonthRevenue[] | null
	}>({
		appointments: null,
		surgeries: null,
		newPatients: null,
		revenue: null,
	})
	const [predicted, setPredicted] = useState<{
		appointments: MonthCount[] | null
		surgeries: MonthCount[] | null
		newPatients: MonthCount[] | null
		revenue: MonthRevenue[] | null
	}>({
		appointments: null,
		surgeries: null,
		newPatients: null,
		revenue: null,
	})
	const [loading, setLoading] = useState<Record<ChartKey, boolean>>({
		appointments: false,
		surgeries: false,
		newPatients: false,
		revenue: false,
	})
	const [initialLoading, setInitialLoading] = useState(true)
	const [initialError, setInitialError] = useState<string | null>(null)

	const fetchOneChart = useCallback(
		async (key: ChartKey, start?: string, end?: string) => {
			setLoading((prev) => ({ ...prev, [key]: true }))
			try {
				const result = await getChartsStats(
					doctorId ?? undefined,
					start || undefined,
					end || undefined,
				)
				if (key === "appointments") {
					setData((prev) => ({ ...prev, appointments: result.appointmentsByMonth }))
					if (result.appointmentsByMonthPredicted) {
						setPredicted((p) => ({ ...p, appointments: result.appointmentsByMonthPredicted ?? null }))
					}
				} else if (key === "surgeries") {
					setData((prev) => ({ ...prev, surgeries: result.surgeriesByMonth }))
					if (result.surgeriesByMonthPredicted) {
						setPredicted((p) => ({ ...p, surgeries: result.surgeriesByMonthPredicted ?? null }))
					}
				} else if (key === "newPatients") {
					setData((prev) => ({ ...prev, newPatients: result.newPatientsByMonth }))
					if (result.newPatientsByMonthPredicted) {
						setPredicted((p) => ({ ...p, newPatients: result.newPatientsByMonthPredicted ?? null }))
					}
				} else {
					setData((prev) => ({ ...prev, revenue: result.revenueByMonth }))
					if (result.revenueByMonthPredicted) {
						setPredicted((p) => ({ ...p, revenue: result.revenueByMonthPredicted ?? null }))
					}
				}
			} catch (e) {
				const message =
					e instanceof Error ? e.message : "Error al cargar el gráfico"
				toast.error(message)
			} finally {
				setLoading((prev) => ({ ...prev, [key]: false }))
			}
		},
		[doctorId],
	)

	// Carga inicial: un solo request sin rango para rellenar los 4 gráficos
	useEffect(() => {
		let cancelled = false
		async function load() {
			setInitialLoading(true)
			setInitialError(null)
			try {
				const result = await getChartsStats(doctorId ?? undefined)
				if (!cancelled) {
					setData({
						appointments: result.appointmentsByMonth,
						surgeries: result.surgeriesByMonth,
						newPatients: result.newPatientsByMonth,
						revenue: result.revenueByMonth,
					})
					setPredicted({
						appointments: result.appointmentsByMonthPredicted ?? null,
						surgeries: result.surgeriesByMonthPredicted ?? null,
						newPatients: result.newPatientsByMonthPredicted ?? null,
						revenue: result.revenueByMonthPredicted ?? null,
					})
				}
			} catch (e) {
				if (!cancelled) {
					const message =
						e instanceof Error ? e.message : "Error al cargar los gráficos"
					setInitialError(message)
					toast.error(message)
				}
			} finally {
				if (!cancelled) setInitialLoading(false)
			}
		}
		load()
		return () => {
			cancelled = true
		}
	}, [doctorId])

	const handleRangeChange = useCallback(
		(key: ChartKey, dates: null | [Dayjs, Dayjs]) => {
			if (!dates) {
				setRanges((prev) => ({
					...prev,
					[key]: { start: "", end: "" },
				}))
				// Recargar con rango por defecto (últimos 12 meses)
				fetchOneChart(key)
				return
			}
			const [start, end] = dates
			const startStr = start.format("YYYY-MM-DD")
			const endStr = end.format("YYYY-MM-DD")
			setRanges((prev) => ({
				...prev,
				[key]: { start: startStr, end: endStr },
			}))
			fetchOneChart(key, startStr, endStr)
		},
		[fetchOneChart],
	)

	if (initialLoading && !data.appointments && !data.surgeries && !data.newPatients && !data.revenue) {
		return (
			<div className="flex justify-center py-12">
				<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
			</div>
		)
	}

	if (initialError && !data.appointments && !data.surgeries && !data.newPatients && !data.revenue) {
		return (
			<div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
				{initialError}
			</div>
		)
	}

	const isDefaultRange = (key: ChartKey) =>
		!ranges[key].start && !ranges[key].end

	const appointmentsData = (() => {
		const hist = data.appointments ?? []
		const pred = isDefaultRange("appointments") ? predicted.appointments : null
		if (pred?.length) {
			return [
				...hist.map((m) => ({
					monthLabel: m.monthLabel,
					historico: m.count,
					prediccion: 0,
				})),
				...pred.map((m) => ({
					monthLabel: m.monthLabel,
					historico: 0,
					prediccion: m.count,
				})),
			]
		}
		return hist.map((m) => ({ monthLabel: m.monthLabel, citas: m.count }))
	})()
	const surgeriesData = (() => {
		const hist = data.surgeries ?? []
		const pred = isDefaultRange("surgeries") ? predicted.surgeries : null
		if (pred?.length) {
			return [
				...hist.map((m) => ({
					monthLabel: m.monthLabel,
					historico: m.count,
					prediccion: 0,
				})),
				...pred.map((m) => ({
					monthLabel: m.monthLabel,
					historico: 0,
					prediccion: m.count,
				})),
			]
		}
		return hist.map((m) => ({ monthLabel: m.monthLabel, cirugias: m.count }))
	})()
	const newPatientsData = (() => {
		const hist = data.newPatients ?? []
		const pred = isDefaultRange("newPatients") ? predicted.newPatients : null
		if (pred?.length) {
			return [
				...hist.map((m) => ({
					monthLabel: m.monthLabel,
					historico: m.count,
					prediccion: 0,
				})),
				...pred.map((m) => ({
					monthLabel: m.monthLabel,
					historico: 0,
					prediccion: m.count,
				})),
			]
		}
		return hist.map((m) => ({ monthLabel: m.monthLabel, pacientes: m.count }))
	})()
	const revenueData = (() => {
		const hist = data.revenue ?? []
		const pred = isDefaultRange("revenue") ? predicted.revenue : null
		if (pred?.length) {
			return [
				...hist.map((m) => ({
					monthLabel: m.monthLabel,
					historico: m.revenue_usd,
					prediccion: 0,
				})),
				...pred.map((m) => ({
					monthLabel: m.monthLabel,
					historico: 0,
					prediccion: m.revenue_usd,
				})),
			]
		}
		return hist.map((m) => ({ monthLabel: m.monthLabel, ingresos: m.revenue_usd }))
	})()

	const appointmentsWithPrediction = isDefaultRange("appointments") && (predicted.appointments?.length ?? 0) > 0
	const surgeriesWithPrediction = isDefaultRange("surgeries") && (predicted.surgeries?.length ?? 0) > 0
	const newPatientsWithPrediction = isDefaultRange("newPatients") && (predicted.newPatients?.length ?? 0) > 0
	const revenueWithPrediction = isDefaultRange("revenue") && (predicted.revenue?.length ?? 0) > 0

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-2 text-gray-800">
				<FaChartBar className="text-primary" />
				<h2 className="text-xl font-bold">Comparación por meses</h2>
			</div>
			<p className="text-sm text-gray-600">
				Cada gráfico tiene su propio rango de fechas. Al cambiarlo solo se
				actualiza ese gráfico.
			</p>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 flex flex-col min-h-[320px]">
					<div className="flex flex-wrap items-center gap-2 mb-4">
						<span className="text-xs font-medium text-gray-600">
							Rango de fechas (citas)
						</span>
						<RangePicker
							size="middle"
							value={
								ranges.appointments.start && ranges.appointments.end
									? [dayjs(ranges.appointments.start), dayjs(ranges.appointments.end)]
									: null
							}
							onChange={(dates) => handleRangeChange("appointments", dates)}
							allowClear
							format="DD/MM/YYYY"
							className="max-w-xs"
						/>
					</div>
					{loading.appointments ? (
						<div className="flex-1 flex items-center justify-center min-h-[200px]">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
						</div>
					) : (
						<BarChartCard
							embedded
							title="Citas médicas por mes"
							description={appointmentsWithPrediction ? "Histórico + predicción (promedio últimos 12 meses)" : "Total de citas programadas/completadas/pendientes"}
							data={appointmentsData}
							dataKey={appointmentsWithPrediction ? "historico" : "citas"}
							dataKeyPrediccion={appointmentsWithPrediction ? "prediccion" : undefined}
							valueLabel="Citas"
						/>
					)}
				</div>

				<div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 flex flex-col min-h-[320px]">
					<div className="flex flex-wrap items-center gap-2 mb-4">
						<span className="text-xs font-medium text-gray-600">
							Rango de fechas (cirugías)
						</span>
						<RangePicker
							size="middle"
							value={
								ranges.surgeries.start && ranges.surgeries.end
									? [dayjs(ranges.surgeries.start), dayjs(ranges.surgeries.end)]
									: null
							}
							onChange={(dates) => handleRangeChange("surgeries", dates)}
							allowClear
							format="DD/MM/YYYY"
							className="max-w-xs"
						/>
					</div>
					{loading.surgeries ? (
						<div className="flex-1 flex items-center justify-center min-h-[200px]">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
						</div>
					) : (
						<BarChartCard
							embedded
							title="Cirugías por mes (demanda sala)"
							description={surgeriesWithPrediction ? "Histórico + predicción (promedio últimos 12 meses)" : "Solicitudes de sala de cirugía por mes"}
							data={surgeriesData}
							dataKey={surgeriesWithPrediction ? "historico" : "cirugias"}
							dataKeyPrediccion={surgeriesWithPrediction ? "prediccion" : undefined}
							valueLabel="Cirugías"
						/>
					)}
				</div>

				<div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 flex flex-col min-h-[320px]">
					<div className="flex flex-wrap items-center gap-2 mb-4">
						<span className="text-xs font-medium text-gray-600">
							Rango de fechas (pacientes)
						</span>
						<RangePicker
							size="middle"
							value={
								ranges.newPatients.start && ranges.newPatients.end
									? [dayjs(ranges.newPatients.start), dayjs(ranges.newPatients.end)]
									: null
							}
							onChange={(dates) => handleRangeChange("newPatients", dates)}
							allowClear
							format="DD/MM/YYYY"
							className="max-w-xs"
						/>
					</div>
					{loading.newPatients ? (
						<div className="flex-1 flex items-center justify-center min-h-[200px]">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
						</div>
					) : (
						<BarChartCard
							embedded
							title="Nuevos pacientes por mes"
							description={newPatientsWithPrediction ? "Histórico + predicción (promedio últimos 12 meses)" : "Pacientes registrados por mes"}
							data={newPatientsData}
							dataKey={newPatientsWithPrediction ? "historico" : "pacientes"}
							dataKeyPrediccion={newPatientsWithPrediction ? "prediccion" : undefined}
							valueLabel="Pacientes"
						/>
					)}
				</div>

				<div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 flex flex-col min-h-[320px]">
					<div className="flex flex-wrap items-center gap-2 mb-4">
						<span className="text-xs font-medium text-gray-600">
							Rango de fechas (ingresos)
						</span>
						<RangePicker
							size="middle"
							value={
								ranges.revenue.start && ranges.revenue.end
									? [dayjs(ranges.revenue.start), dayjs(ranges.revenue.end)]
									: null
							}
							onChange={(dates) => handleRangeChange("revenue", dates)}
							allowClear
							format="DD/MM/YYYY"
							className="max-w-xs"
						/>
					</div>
					{loading.revenue ? (
						<div className="flex-1 flex items-center justify-center min-h-[200px]">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
						</div>
					) : (
						<BarChartCard
							embedded
							title="Ingresos por mes (USD)"
							description={revenueWithPrediction ? "Histórico + predicción (promedio últimos 12 meses)" : "Citas y cirugías con precio"}
							data={revenueData}
							dataKey={revenueWithPrediction ? "historico" : "ingresos"}
							dataKeyPrediccion={revenueWithPrediction ? "prediccion" : undefined}
							valueLabel="Ingresos"
							formatValue={formatCurrency}
							yAxisWidth={64}
						/>
					)}
				</div>
			</div>
		</div>
	)
}

export default ChartsSection

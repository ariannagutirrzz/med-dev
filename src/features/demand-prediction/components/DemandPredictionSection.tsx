import { useCallback, useEffect, useState } from "react"
import { FaCalendarCheck, FaChartLine, FaProcedures, FaUserPlus } from "react-icons/fa"
import { toast } from "react-toastify"
import {
	getDemandPrediction,
	type DemandPredictionResult,
	type PredictionPeriod,
} from "../services/DemandPredictionAPI"

const PERIOD_OPTIONS: { value: PredictionPeriod; label: string }[] = [
	{ value: 7, label: "Próximos 7 días" },
	{ value: 14, label: "Próximos 14 días" },
	{ value: 30, label: "Próximos 30 días" },
]

function formatDate(dateStr: string): string {
	const d = new Date(dateStr + "T12:00:00")
	return d.toLocaleDateString("es-VE", {
		weekday: "short",
		day: "numeric",
		month: "short",
	})
}

const DemandPredictionSection = () => {
	const [period, setPeriod] = useState<PredictionPeriod>(7)
	const [data, setData] = useState<DemandPredictionResult | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const fetchPrediction = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const result = await getDemandPrediction(period)
			setData(result)
		} catch (e) {
			const message =
				e instanceof Error ? e.message : "Error al cargar la predicción"
			setError(message)
			toast.error(message)
		} finally {
			setLoading(false)
		}
	}, [period])

	useEffect(() => {
		fetchPrediction()
	}, [fetchPrediction])

	const predictedAppointments = data?.appointments.byDate.filter(
		(d) => d.type === "predicted",
	) ?? []
	const predictedSurgeries = data?.surgeries.byDate.filter(
		(d) => d.type === "predicted",
	) ?? []

	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
					<FaChartLine className="text-primary" />
					Predicción de demandas
				</h1>
				<p className="text-gray-600">
					Estimación de demanda de citas, cirugías y nuevos pacientes (últimos 90
					días). En unidades con poco volumen la predicción es orientativa.
				</p>
			</div>

			{/* Period selector */}
			<div className="mb-6 flex flex-wrap gap-2">
				{PERIOD_OPTIONS.map((opt) => (
					<button
						key={opt.value}
						type="button"
						onClick={() => setPeriod(opt.value)}
						className={`px-4 py-2 rounded-xl border-2 transition-all ${
							period === opt.value
								? "border-primary bg-primary text-white"
								: "border-gray-300 text-gray-700 hover:border-gray-400"
						}`}
					>
						{opt.label}
					</button>
				))}
			</div>

			{error && (
				<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
					{error}
				</div>
			)}

			{loading ? (
				<div className="flex justify-center py-12">
					<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
				</div>
			) : data ? (
				<>
					{/* Data quality notice for small units */}
					{(data.appointments.meta.dataQuality === "low" ||
						data.surgeries.meta.dataQuality === "low" ||
						data.newPatients.meta.dataQuality === "low") && (
						<div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
							<strong>Unidad con poco volumen.</strong> La predicción se basa
							en pocos datos históricos y es solo orientativa. Use como
							referencia para planificación; la precisión mejorará con más
							registros en el tiempo.
						</div>
					)}

					{/* Summary cards: 3 cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
						<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
							<h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
								<FaCalendarCheck className="text-primary" />
								Citas médicas
							</h2>
							<p className="text-xs text-gray-500 mb-3">
								{data.appointments.meta.totalHistorical} citas en{" "}
								{data.appointments.meta.daysWithData} días
							</p>
							<div className="grid grid-cols-3 gap-4">
								<div className="bg-primary/10 rounded-xl p-3 text-center">
									<p className="text-2xl font-bold text-primary">
										{data.appointments.summary.next7Days}
									</p>
									<p className="text-xs text-gray-600">7 d</p>
								</div>
								<div className="bg-primary/10 rounded-xl p-3 text-center">
									<p className="text-2xl font-bold text-primary">
										{data.appointments.summary.next14Days}
									</p>
									<p className="text-xs text-gray-600">14 d</p>
								</div>
								<div className="bg-primary/10 rounded-xl p-3 text-center">
									<p className="text-2xl font-bold text-primary">
										{data.appointments.summary.next30Days}
									</p>
									<p className="text-xs text-gray-600">30 d</p>
								</div>
							</div>
						</div>
						<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
							<h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
								<FaProcedures className="text-primary" />
								Cirugías
							</h2>
							<p className="text-xs text-gray-500 mb-3">
								{data.surgeries.meta.totalHistorical} cirugías en{" "}
								{data.surgeries.meta.daysWithData} días
							</p>
							<div className="grid grid-cols-3 gap-4">
								<div className="bg-primary/10 rounded-xl p-3 text-center">
									<p className="text-2xl font-bold text-primary">
										{data.surgeries.summary.next7Days}
									</p>
									<p className="text-xs text-gray-600">7 d</p>
								</div>
								<div className="bg-primary/10 rounded-xl p-3 text-center">
									<p className="text-2xl font-bold text-primary">
										{data.surgeries.summary.next14Days}
									</p>
									<p className="text-xs text-gray-600">14 d</p>
								</div>
								<div className="bg-primary/10 rounded-xl p-3 text-center">
									<p className="text-2xl font-bold text-primary">
										{data.surgeries.summary.next30Days}
									</p>
									<p className="text-xs text-gray-600">30 d</p>
								</div>
							</div>
						</div>
						<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
							<h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
								<FaUserPlus className="text-primary" />
								Nuevos pacientes
							</h2>
							<p className="text-xs text-gray-500 mb-3">
								{data.newPatients.meta.totalHistorical} pacientes en{" "}
								{data.newPatients.meta.daysWithData} días
							</p>
							<div className="grid grid-cols-3 gap-4">
								<div className="bg-primary/10 rounded-xl p-3 text-center">
									<p className="text-2xl font-bold text-primary">
										{data.newPatients.summary.next7Days}
									</p>
									<p className="text-xs text-gray-600">7 d</p>
								</div>
								<div className="bg-primary/10 rounded-xl p-3 text-center">
									<p className="text-2xl font-bold text-primary">
										{data.newPatients.summary.next14Days}
									</p>
									<p className="text-xs text-gray-600">14 d</p>
								</div>
								<div className="bg-primary/10 rounded-xl p-3 text-center">
									<p className="text-2xl font-bold text-primary">
										{data.newPatients.summary.next30Days}
									</p>
									<p className="text-xs text-gray-600">30 d</p>
								</div>
							</div>
						</div>
					</div>

					{/* Predicted by date (selected period) */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
							<h3 className="font-semibold text-gray-800 mb-3">
								Citas previstas por día (próximos {period} días)
							</h3>
							<div className="max-h-80 overflow-y-auto space-y-2">
								{predictedAppointments.length === 0 ? (
									<p className="text-gray-500 text-sm">
										No hay suficientes datos históricos para predecir.
									</p>
								) : (
									predictedAppointments.map((row) => (
										<div
											key={row.date}
											className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
										>
											<span className="text-sm text-gray-700">
												{formatDate(row.date)}
											</span>
											<span className="font-medium text-primary">
												{row.count} {row.count === 1 ? "cita" : "citas"}
											</span>
										</div>
									))
								)}
							</div>
						</div>
						<div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
							<h3 className="font-semibold text-gray-800 mb-3">
								Cirugías previstas por día (próximos {period} días)
							</h3>
							<div className="max-h-80 overflow-y-auto space-y-2">
								{predictedSurgeries.length === 0 ? (
									<p className="text-gray-500 text-sm">
										No hay suficientes datos históricos para predecir.
									</p>
								) : (
									predictedSurgeries.map((row) => (
										<div
											key={row.date}
											className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
										>
											<span className="text-sm text-gray-700">
												{formatDate(row.date)}
											</span>
											<span className="font-medium text-primary">
												{row.count}{" "}
												{row.count === 1 ? "cirugía" : "cirugías"}
											</span>
										</div>
									))
								)}
							</div>
						</div>
					</div>

					<p className="mt-4 text-sm text-gray-500">
						La predicción combina el promedio por día de la semana (cuando hay
						suficientes datos) con el promedio global en unidades con poco
						volumen. Útil para planificar insumos y personal.
					</p>
				</>
			) : null}
		</div>
	)
}

export default DemandPredictionSection

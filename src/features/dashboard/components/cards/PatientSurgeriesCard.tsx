import { FaStethoscope } from "react-icons/fa"
import type { Surgery } from "../../../../shared"
import { formatAppointmentDate } from "../../utils/dateUtils"

interface PatientSurgeriesCardProps {
	surgeries: Surgery[]
	loading: boolean
	/** Máximo de cirugías a mostrar (default 5) */
	maxItems?: number
}

const getSurgeryStatusBadge = (status?: string) => {
	const s = status?.toLowerCase() || ""
	if (s === "scheduled") return { className: "bg-green-100 text-green-700", label: "Programada" }
	if (s === "pending") return { className: "bg-yellow-100 text-yellow-700", label: "Pendiente" }
	if (s === "completed") return { className: "bg-blue-100 text-blue-700", label: "Completada" }
	if (s === "cancelled") return { className: "bg-red-100 text-red-700", label: "Cancelada" }
	return { className: "bg-gray-100 text-gray-600", label: status || "—" }
}

const getUpcomingSurgeries = (surgeries: Surgery[], limit: number) => {
	const now = new Date()
	return surgeries
		.filter((s) => {
			const date = new Date(s.surgery_date)
			const status = s.status?.toLowerCase()
			return date >= now && status !== "cancelled" && status !== "completed"
		})
		.sort((a, b) => new Date(a.surgery_date).getTime() - new Date(b.surgery_date).getTime())
		.slice(0, limit)
}

export const PatientSurgeriesCard = ({
	surgeries,
	loading,
	maxItems = 5,
}: PatientSurgeriesCardProps) => {
	const upcoming = getUpcomingSurgeries(surgeries, maxItems)

	return (
		<div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 flex flex-col min-h-0 h-full">
			<h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2">
				<FaStethoscope className="text-primary text-sm sm:text-base" />
				<span>Mis cirugías pendientes</span>
			</h3>
			{loading ? (
				<div className="flex-1 flex items-center justify-center">
					<div className="animate-pulse text-gray-400 text-xs sm:text-sm">Cargando...</div>
				</div>
			) : (
				<div className="flex-1 min-h-0 space-y-1 sm:space-y-1.5">
					{upcoming.length === 0 ? (
						<div className="flex items-center justify-center py-4 sm:py-6 text-gray-400 text-xs sm:text-sm">
							No tienes cirugías pendientes
						</div>
					) : (
						upcoming.map((surgery) => {
							const badge = getSurgeryStatusBadge(surgery.status)
							return (
								<div
									key={surgery.id}
									className="px-2 py-1.5 sm:px-2.5 sm:py-2 bg-gray-50 rounded-md border border-gray-200 hover:border-primary/30 transition-colors"
								>
									<div className="flex items-center justify-between gap-2">
										<div className="flex-1 min-w-0">
											<p className="font-medium text-gray-800 text-xs truncate">
												{surgery.doctor_name || "Médico"}
											</p>
											<p className="text-[11px] sm:text-xs text-gray-600 mt-0.5">
												{formatAppointmentDate(surgery.surgery_date)}
												{surgery.surgery_type ? ` · ${surgery.surgery_type}` : ""}
											</p>
										</div>
										<span
											className={`px-1.5 py-0.5 text-[10px] sm:text-xs font-medium rounded shrink-0 ${badge.className}`}
										>
											{badge.label}
										</span>
									</div>
								</div>
							)
						})
					)}
				</div>
			)}
		</div>
	)
}

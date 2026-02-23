import { FaClock, FaStethoscope } from "react-icons/fa"
import type { Appointment, Surgery } from "../../../../shared"
import { formatAppointmentDate } from "../../utils/dateUtils"
import { getUpcomingAppointments, getAppointmentStatusBadge } from "../../utils/appointmentUtils"

interface PatientAppointmentsAndSurgeriesCardProps {
	appointments: Appointment[]
	surgeries: Surgery[]
	loading: boolean
	maxAppointments?: number
	maxSurgeries?: number
}

const getSurgeryStatusBadge = (status?: string) => {
	const s = status?.toLowerCase() || ""
	if (s === "scheduled") return { className: "bg-green-100 text-green-700", label: "Programada" }
	if (s === "pending") return { className: "bg-yellow-100 text-yellow-700", label: "Pendiente" }
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

const rowClass =
	"px-2 py-1.5 sm:px-2.5 sm:py-2 bg-gray-50 rounded-md border border-gray-200 hover:border-primary/30 transition-colors"

export const PatientAppointmentsAndSurgeriesCard = ({
	appointments,
	surgeries,
	loading,
	maxAppointments = 3,
	maxSurgeries = 3,
}: PatientAppointmentsAndSurgeriesCardProps) => {
	const upcomingAppointments = getUpcomingAppointments(appointments, maxAppointments)
	const upcomingSurgeries = getUpcomingSurgeries(surgeries, maxSurgeries)

	return (
		<div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 flex flex-col min-h-0 h-full">
			{loading ? (
				<div className="flex-1 flex items-center justify-center">
					<div className="animate-pulse text-gray-400 text-xs sm:text-sm">Cargando...</div>
				</div>
			) : (
				<div className="flex-1 min-h-0 flex flex-col gap-4 sm:gap-5">
					{/* Citas */}
					<div className="min-h-0 flex flex-col">
						<h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 mb-1.5 sm:mb-2 flex items-center gap-1 sm:gap-2">
							<FaClock className="text-primary text-sm sm:text-base shrink-0" />
							<span>Mis Próximas Citas</span>
						</h3>
						<div className="space-y-1 sm:space-y-1.5">
							{upcomingAppointments.length === 0 ? (
								<p className="text-gray-400 text-[11px] sm:text-xs py-2">
									No tienes citas próximas
								</p>
							) : (
								upcomingAppointments.map((apt) => {
									const badge = getAppointmentStatusBadge(apt.status)
									return (
										<div key={apt.id} className={rowClass}>
											<div className="flex items-center justify-between gap-2">
												<div className="flex-1 min-w-0">
													<p className="font-medium text-gray-800 text-xs truncate">
														{apt.doctor_name || "Médico"}
													</p>
													<p className="text-[11px] sm:text-xs text-gray-600 mt-0.5">
														{formatAppointmentDate(apt.appointment_date)}
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
					</div>

					{/* Cirugías */}
					<div className="min-h-0 flex flex-col border-t border-gray-100 pt-3 sm:pt-4">
						<h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 mb-1.5 sm:mb-2 flex items-center gap-1 sm:gap-2">
							<FaStethoscope className="text-primary text-sm sm:text-base shrink-0" />
							<span>Mis Cirugías Pendientes</span>
						</h3>
						<div className="space-y-1 sm:space-y-1.5">
							{upcomingSurgeries.length === 0 ? (
								<p className="text-gray-400 text-[11px] sm:text-xs py-2">
									No tienes cirugías pendientes
								</p>
							) : (
								upcomingSurgeries.map((surgery) => {
									const badge = getSurgeryStatusBadge(surgery.status)
									return (
										<div key={surgery.id} className={rowClass}>
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
					</div>
				</div>
			)}
		</div>
	)
}

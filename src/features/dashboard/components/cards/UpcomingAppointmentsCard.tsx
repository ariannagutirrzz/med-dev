import { FaClock } from "react-icons/fa"
import type { Appointment } from "../../../../shared"
import { formatAppointmentDate } from "../../utils/dateUtils"
import { getUpcomingAppointments, getAppointmentStatusBadge } from "../../utils/appointmentUtils"

interface UpcomingAppointmentsCardProps {
	appointments: Appointment[]
	loading: boolean
	title: string
	emptyMessage: string
	showPatientName?: boolean
	/** Máximo de citas a mostrar (default 4) */
	maxAppointments?: number
}

export const UpcomingAppointmentsCard = ({
	appointments,
	loading,
	title,
	emptyMessage,
	showPatientName = true,
	maxAppointments = 4,
}: UpcomingAppointmentsCardProps) => {
	const upcomingAppointments = getUpcomingAppointments(appointments, maxAppointments)

	return (
		<div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 flex flex-col min-h-0 h-full">
			<h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2">
				<FaClock className="text-primary text-sm sm:text-base" />
				<span>{title}</span>
			</h3>
			{loading ? (
				<div className="flex-1 flex items-center justify-center">
					<div className="animate-pulse text-gray-400 text-xs sm:text-sm">Cargando...</div>
				</div>
			) : (
				<div className="flex-1 min-h-0 space-y-1 sm:space-y-1.5">
					{upcomingAppointments.length === 0 ? (
						<div className="flex items-center justify-center py-4 sm:py-6 text-gray-400 text-xs sm:text-sm">
							{emptyMessage}
						</div>
					) : (
						upcomingAppointments.map((apt) => {
							const badge = getAppointmentStatusBadge(apt.status)
							return (
								<div
									key={apt.id}
									className="px-2 py-1.5 sm:px-2.5 sm:py-2 bg-gray-50 rounded-md border border-gray-200 hover:border-primary/30 transition-colors"
								>
									<div className="flex items-center justify-between gap-2">
										<div className="flex-1 min-w-0">
											<p className="font-medium text-gray-800 text-xs truncate">
												{showPatientName
													? apt.patient_name || "Paciente"
													: apt.doctor_name || "Médico"}
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
			)}
		</div>
	)
}

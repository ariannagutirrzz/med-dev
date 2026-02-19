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
}

export const UpcomingAppointmentsCard = ({
	appointments,
	loading,
	title,
	emptyMessage,
	showPatientName = true,
}: UpcomingAppointmentsCardProps) => {
	const upcomingAppointments = getUpcomingAppointments(appointments, 5)

	return (
		<div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 flex flex-col min-h-[200px] sm:min-h-[240px]">
			<h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-1 sm:gap-2">
				<FaClock className="text-primary text-sm sm:text-base" />
				<span>{title}</span>
			</h3>
			{loading ? (
				<div className="flex-1 flex items-center justify-center">
					<div className="animate-pulse text-gray-400 text-xs sm:text-sm">Cargando...</div>
				</div>
			) : (
				<div className="flex-1 space-y-1.5 sm:space-y-2">
					{upcomingAppointments.length === 0 ? (
						<div className="flex items-center justify-center py-6 sm:py-8 text-gray-400 text-xs sm:text-sm">
							{emptyMessage}
						</div>
					) : (
						upcomingAppointments.map((apt) => {
							const badge = getAppointmentStatusBadge(apt.status)
							return (
								<div
									key={apt.id}
									className="p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary/30 transition-colors"
								>
									<div className="flex items-center justify-between gap-2">
										<div className="flex-1 min-w-0">
											<p className="font-medium text-gray-800 text-xs sm:text-sm truncate">
												{showPatientName
													? apt.patient_name || "Paciente"
													: apt.doctor_name || "Médico"}
											</p>
											<p className="text-xs text-gray-600 mt-0.5 sm:mt-1">
												{formatAppointmentDate(apt.appointment_date)}
											</p>
										</div>
										<span
											className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded shrink-0 ${badge.className}`}
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

import { FaCalendarCheck, FaUserInjured, FaStethoscope } from "react-icons/fa"
import type { Appointment, Patient, Surgery } from "../../../../shared"
import { formatFullDate } from "../../utils/dateUtils"

interface SearchResultsProps {
	searchTerm: string
	appointments: Appointment[]
	surgeries: Surgery[]
	patients: Patient[]
	hasResults: boolean
	userRole?: string
}

export const SearchResults = ({
	searchTerm,
	appointments,
	surgeries,
	patients,
	hasResults,
	userRole,
}: SearchResultsProps) => {
	if (!searchTerm.trim()) return null

	return (
		<div className="mb-4 sm:mb-6 bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6">
			<h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
				Resultados de búsqueda para: "{searchTerm}"
			</h3>
			{hasResults ? (
				<div className="space-y-4">
					{appointments.length > 0 && (
						<div>
							<h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1 sm:gap-2">
								<FaCalendarCheck className="text-primary text-sm sm:text-base" />
								<span>Citas ({appointments.length})</span>
							</h4>
							<div className="space-y-1.5 sm:space-y-2">
								{appointments.slice(0, 5).map((apt) => (
									<div
										key={apt.id}
										className="p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary transition-colors"
									>
										<p className="font-medium text-gray-800 text-xs sm:text-sm md:text-base">
											{apt.patient_name || "Paciente desconocido"}
										</p>
										<p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
											{formatFullDate(apt.appointment_date)}
										</p>
										{apt.notes && (
											<p className="text-xs text-gray-500 mt-1">{apt.notes}</p>
										)}
									</div>
								))}
								{appointments.length > 5 && (
									<p className="text-xs text-gray-500 text-center">
										Y {appointments.length - 5} más...
									</p>
								)}
							</div>
						</div>
					)}

					{surgeries.length > 0 && userRole === "Médico" && (
						<div>
							<h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1 sm:gap-2">
								<FaStethoscope className="text-primary text-sm sm:text-base" />
								<span>Cirugías ({surgeries.length})</span>
							</h4>
							<div className="space-y-1.5 sm:space-y-2">
								{surgeries.slice(0, 5).map((surgery) => (
									<div
										key={surgery.id}
										className="p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary transition-colors"
									>
										<p className="font-medium text-gray-800 text-xs sm:text-sm md:text-base">
											{`${surgery.patient_first_name || ""} ${surgery.patient_last_name || ""}`.trim() ||
												"Paciente desconocido"}
										</p>
										<p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
											{surgery.surgery_type} -{" "}
											{new Date(surgery.surgery_date).toLocaleDateString("es-ES")}
										</p>
										{surgery.notes && (
											<p className="text-xs text-gray-500 mt-1">{surgery.notes}</p>
										)}
									</div>
								))}
								{surgeries.length > 5 && (
									<p className="text-xs text-gray-500 text-center">
										Y {surgeries.length - 5} más...
									</p>
								)}
							</div>
						</div>
					)}

					{patients.length > 0 && userRole === "Médico" && (
						<div>
							<h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1 sm:gap-2">
								<FaUserInjured className="text-blue-600 text-sm sm:text-base" />
								<span>Pacientes ({patients.length})</span>
							</h4>
							<div className="space-y-1.5 sm:space-y-2">
								{patients.slice(0, 5).map((patient) => (
									<div
										key={patient.document_id}
										className="p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary transition-colors"
									>
										<p className="font-medium text-gray-800 text-xs sm:text-sm md:text-base">
											{`${patient.first_name || ""} ${patient.last_name || ""}`.trim() ||
												"Paciente desconocido"}
										</p>
										<p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
											{patient.email && `${patient.email} • `}
											{patient.document_id && `CI: ${patient.document_id}`}
										</p>
									</div>
								))}
								{patients.length > 5 && (
									<p className="text-xs text-gray-500 text-center">
										Y {patients.length - 5} más...
									</p>
								)}
							</div>
						</div>
					)}
				</div>
			) : (
				<p className="text-gray-500 text-center py-3 sm:py-4 text-xs sm:text-sm">
					No se encontraron resultados para "{searchTerm}"
				</p>
			)}
		</div>
	)
}

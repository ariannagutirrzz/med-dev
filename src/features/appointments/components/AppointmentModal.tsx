import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { FaCalendar, FaClock, FaSave, FaTimes, FaUser, FaUserMd } from "react-icons/fa"
import { toast } from "react-toastify"
import { useAuth } from "../../auth"
import {
	createAppointment,
	updateAppointmentById,
} from "../services/AppointmentsAPI"
import { getPatients } from "../../patients"
import { api } from "../../../config/axios"
import type { Appointment, AppointmentFormData, Patient } from "../../../shared"

interface AppointmentModalProps {
	isOpen: boolean
	onClose: () => void
	onSuccess: () => void
	editingAppointment?: Appointment | null
}

interface Doctor {
	document_id: string
	name: string
	role: string
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
	isOpen,
	onClose,
	onSuccess,
	editingAppointment,
}) => {
	const { user } = useAuth()
	const [loading, setLoading] = useState(false)
	const [patients, setPatients] = useState<Patient[]>([])
	const [doctors, setDoctors] = useState<Doctor[]>([])
	const [loadingData, setLoadingData] = useState(false)

	const initialValues: AppointmentFormData = {
		patient_id: "",
		doctor_id: "",
		appointment_date: "",
		status: "scheduled",
		notes: "",
	}

	const [formData, setFormData] = useState<AppointmentFormData>(initialValues)

	// Cargar pacientes y doctores
	const loadPatientsAndDoctors = useCallback(async () => {
		setLoadingData(true)
		const isDoctorUser = user?.role === "Médico"
		
		try {
			// Cargar pacientes solo si el usuario es médico
			if (isDoctorUser) {
				try {
					const patientsData = await getPatients()
					if (patientsData?.patients) {
						// No necesitamos convertir birthdate a Date para el modal de citas
						// Solo necesitamos los datos básicos para mostrar en el select
						const formattedPatients = patientsData.patients.map((p: Patient) => {
							let birthdate: Date
							if (p.birthdate instanceof Date) {
								birthdate = p.birthdate
							} else if (p.birthdate) {
								const date = new Date(p.birthdate)
								birthdate = Number.isNaN(date.getTime()) ? new Date() : date
							} else {
								birthdate = new Date()
							}
							return {
								...p,
								birthdate,
							}
						})
						setPatients(formattedPatients)
					} else {
						setPatients([])
					}
				} catch (patientsError) {
					console.error("Error cargando pacientes:", patientsError)
					setPatients([])
					// No mostramos error si el usuario no es médico, es esperado
				}
			} else {
				// Si no es médico, no necesita cargar pacientes
				setPatients([])
			}

			// Cargar doctores (disponible para todos los usuarios autenticados)
			try {
				const { data: doctorsData } = await api.get("/users/medicos")
				if (doctorsData?.doctors) {
					setDoctors(doctorsData.doctors)
				} else {
					setDoctors([])
				}
			} catch (doctorsError) {
				console.error("Error cargando doctores:", doctorsError)
				setDoctors([])
				toast.error("No se pudo cargar la lista de médicos")
			}
		} catch (error) {
			console.error("Error cargando datos:", error)
			const errorMessage =
				error instanceof Error ? error.message : "Error desconocido"
			toast.error(`Error al cargar datos: ${errorMessage}`)
			setPatients([])
			setDoctors([])
		} finally {
			setLoadingData(false)
		}
	}, [user?.role])

	useEffect(() => {
		if (isOpen) {
			loadPatientsAndDoctors()
		}
	}, [isOpen, loadPatientsAndDoctors])

	// Cargar datos del appointment si es edición
	useEffect(() => {
		if (editingAppointment) {
			// Convertir appointment_date de ISO string a formato datetime-local
			const appointmentDate = new Date(editingAppointment.appointment_date)
			const localDateTime = new Date(
				appointmentDate.getTime() - appointmentDate.getTimezoneOffset() * 60000,
			)
				.toISOString()
				.slice(0, 16) // Formato YYYY-MM-DDTHH:mm

			setFormData({
				patient_id: editingAppointment.patient_id,
				doctor_id: editingAppointment.doctor_id,
				appointment_date: localDateTime,
				status: editingAppointment.status,
				notes: editingAppointment.notes || "",
			})
		} else {
			// Si el usuario es médico, establecer su doctor_id automáticamente
			if (user?.role === "Médico" && user?.document_id) {
				setFormData({
					...initialValues,
					doctor_id: user.document_id,
				})
			} else {
				setFormData(initialValues)
			}
		}
	}, [editingAppointment, user])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)

		try {
			// Convertir fecha local a ISO string para el backend
			const dateTime = new Date(formData.appointment_date)
			const isoDateTime = dateTime.toISOString()

			const appointmentData: AppointmentFormData = {
				...formData,
				appointment_date: isoDateTime,
			}

			if (editingAppointment) {
				// Actualizar cita existente
				await updateAppointmentById(editingAppointment.id, appointmentData)
				toast.success("Cita actualizada con éxito")
			} else {
				// Crear nueva cita
				await createAppointment(appointmentData)
				toast.success("Cita creada correctamente")
			}

			onSuccess()
			onClose()
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Error al procesar la cita",
			)
		} finally {
			setLoading(false)
		}
	}

	if (!isOpen) return null

	const inputClass =
		"w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"

	const isDoctor = user?.role === "Médico"

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 w-full bg-black/90 backdrop-blur-sm">
			<div className="bg-gray-100 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
				{/* Header del Modal */}
				<div className="p-6 flex justify-between items-center">
					<div>
						<h2 className="text-xl font-bold text-gray-800">
							{editingAppointment ? "Editar Cita" : "Nueva Cita"}
						</h2>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
					>
						<FaTimes size={20} />
					</button>
				</div>

				{/* Formulario */}
				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-3xl shadow-lg">
						{/* Paciente - Solo visible si es médico */}
						{isDoctor && (
							<div className="md:col-span-2 relative">
								<label
									htmlFor="patient_id"
									className="text-xs font-bold text-gray-700 mb-1 block ml-1"
								>
									Paciente *
								</label>
								<FaUser className="absolute left-3 bottom-3 text-gray-400" />
								<select
									id="patient_id"
									value={formData.patient_id}
									required={isDoctor}
									disabled={loadingData}
									className={inputClass}
									onChange={(e) =>
										setFormData({ ...formData, patient_id: e.target.value })
									}
								>
									<option value="">Seleccionar paciente...</option>
									{patients.map((patient) => (
										<option
											key={patient.document_id}
											value={patient.document_id}
										>
											{patient.first_name} {patient.last_name} -{" "}
											{patient.document_id}
										</option>
									))}
								</select>
							</div>
						)}

						{/* Doctor - Solo visible si NO es médico */}
						{!isDoctor && (
							<div className="md:col-span-2 relative">
								<label
									htmlFor="doctor_id"
									className="text-xs font-bold text-gray-700 mb-1 block ml-1"
								>
									Médico *
								</label>
								<FaUserMd className="absolute left-3 bottom-3 text-gray-400" />
								<select
									id="doctor_id"
									value={formData.doctor_id}
									required={!isDoctor}
									disabled={loadingData}
									className={inputClass}
									onChange={(e) =>
										setFormData({ ...formData, doctor_id: e.target.value })
									}
								>
									<option value="">Seleccionar médico...</option>
									{doctors.map((doctor) => (
										<option key={doctor.document_id} value={doctor.document_id}>
											{doctor.name} - {doctor.document_id}
										</option>
									))}
								</select>
							</div>
						)}

						{/* Fecha */}
						<div className="relative">
							<label
								htmlFor="appointment_date"
								className="text-xs font-bold text-gray-700 mb-1 block ml-1"
							>
								Fecha *
							</label>
							<FaCalendar className="absolute left-3 bottom-3 text-gray-400" />
							<input
								id="appointment_date"
								type="date"
								value={formData.appointment_date.split("T")[0] || ""}
								required
								className={inputClass}
								onChange={(e) => {
									const date = e.target.value
									const time = formData.appointment_date.split("T")[1] || "09:00"
									setFormData({
										...formData,
										appointment_date: `${date}T${time}`,
									})
								}}
							/>
						</div>

						{/* Hora */}
						<div className="relative">
							<label
								htmlFor="appointment_time"
								className="text-xs font-bold text-gray-700 mb-1 block ml-1"
							>
								Hora *
							</label>
							<FaClock className="absolute left-3 bottom-3 text-gray-400" />
							<input
								id="appointment_time"
								type="time"
								value={formData.appointment_date.split("T")[1] || "09:00"}
								required
								className={inputClass}
								onChange={(e) => {
									const time = e.target.value
									const date = formData.appointment_date.split("T")[0] || ""
									setFormData({
										...formData,
										appointment_date: `${date}T${time}`,
									})
								}}
							/>
						</div>

						{/* Estado - Solo editable por médicos */}
						{isDoctor && (
							<div className="relative">
								<label
									htmlFor="status"
									className="text-xs font-bold text-gray-700 mb-1 block ml-1"
								>
									Estado
								</label>
								<select
									id="status"
									value={formData.status}
									className={inputClass}
									onChange={(e) =>
										setFormData({
											...formData,
											status: e.target.value as AppointmentFormData["status"],
										})
									}
								>
									<option value="pending">Pendiente</option>
									<option value="scheduled">Programada</option>
									<option value="cancelled">Cancelada</option>
									<option value="completed">Completada</option>
								</select>
							</div>
						)}

						{/* Caso/Motivo */}
						<div className="md:col-span-2">
							<label
								htmlFor="notes"
								className="text-xs font-bold text-gray-700 mb-1 block ml-1"
							>
								Caso/Motivo de la cita *
							</label>
							<textarea
								id="notes"
								rows={3}
								value={formData.notes || ""}
								required
								className={inputClass}
								placeholder="Describe el motivo o caso de la cita médica..."
								onChange={(e) =>
									setFormData({ ...formData, notes: e.target.value })
								}
							/>
						</div>
					</div>

					{/* Botones de Acción */}
					<div className="flex gap-3 pt-4">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 py-3 border-2 cursor-pointer border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-colors"
						>
							Cancelar
						</button>
						<button
							type="submit"
							disabled={loading || loadingData}
							className="flex-1 py-3 cursor-pointer bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
						>
							{loading ? (
								"Guardando..."
							) : (
								<>
									<FaSave /> {editingAppointment ? "Actualizar" : "Crear"} Cita
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default AppointmentModal

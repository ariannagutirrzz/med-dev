import { DatePicker, Select, TimePicker } from "antd"
import type { Dayjs } from "dayjs"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
import type React from "react"
import { useCallback, useEffect, useState } from "react"
import {
	FaCalendar,
	FaClock,
	FaSave,
	FaTimes,
	FaUser,
	FaUserMd,
} from "react-icons/fa"
import "dayjs/locale/es"
import { toast } from "react-toastify"
import { api } from "../../../config/axios"
import type { Appointment, AppointmentFormData, Patient } from "../../../shared"
import { formatPrice } from "../../../shared"
import { useAuth } from "../../auth"
import { getCurrencyRates } from "../../currency/services/CurrencyAPI"
import { getPatients } from "../../patients"
import type { DoctorServiceWithType } from "../../services"
import { getDoctorServices } from "../../services"
import {
	getSettings,
	type UserSettings,
} from "../../settings/services/SettingsAPI"
import {
	createAppointment,
	updateAppointmentById,
} from "../services/AppointmentsAPI"
import {
	type DoctorAvailability,
	getAvailableTimeSlots,
	getDoctorAvailability,
} from "../services/DoctorAvailabilityAPI"
import {
	type DoctorUnavailability,
	getDoctorUnavailability,
} from "../services/DoctorUnavailabilityAPI"

dayjs.extend(customParseFormat)
dayjs.extend(isSameOrAfter) // Activa el plugin
dayjs.extend(isSameOrBefore) // Activa el plugin
dayjs.locale("es")

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
	const [services, setServices] = useState<DoctorServiceWithType[]>([])
	const [settings, setSettings] = useState<UserSettings | null>(null)
	const [currencyRates, setCurrencyRates] = useState<any>(null)
	const [selectedService, setSelectedService] =
		useState<DoctorServiceWithType | null>(null)
	const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
	const [availability, setAvailability] = useState<DoctorAvailability[]>([])
	const [unavailability, setUnavailability] = useState<DoctorUnavailability[]>(
		[],
	)
	const [loadingTimeSlots, setLoadingTimeSlots] = useState(false)

	const initialValues: AppointmentFormData = {
		patient_id: "",
		doctor_id: "",
		appointment_date: "",
		status: "scheduled",
		notes: "",
		service_id: null,
	}

	const [formData, setFormData] = useState<AppointmentFormData>(initialValues)

	const loadDoctorSchedule = useCallback(async (doctorId: string) => {
		try {
			const [availRes, unavailRes] = await Promise.all([
				getDoctorAvailability(doctorId), // Ajusta la ruta a tu API
				getDoctorUnavailability(doctorId),
			])
			setAvailability(availRes.availability)
			setUnavailability(unavailRes.unavailability || [])
		} catch (error) {
			console.error("Error cargando horarios:", error)
		}
	}, [])

	// Ejecutar cuando cambie el doctor_id
	useEffect(() => {
		if (formData.doctor_id) {
			loadDoctorSchedule(formData.doctor_id)
		}
	}, [formData.doctor_id, loadDoctorSchedule])

	// Cargar servicios cuando cambia el doctor_id
	const loadServices = useCallback(async (doctorId: string) => {
		if (!doctorId) {
			setServices([])
			setSelectedService(null)
			return
		}
		try {
			const [servicesData, settingsData, ratesData] = await Promise.all([
				getDoctorServices(doctorId),
				getSettings().catch(() => null),
				getCurrencyRates().catch(() => null),
			])
			setServices(servicesData.filter((s) => s.is_active))
			setSettings(settingsData)
			setCurrencyRates(ratesData)
		} catch (error) {
			console.error("Error loading services:", error)
			setServices([])
		}
	}, [])

	// Cargar slots disponibles cuando cambia el doctor_id o la fecha
	const loadAvailableTimeSlots = useCallback(
		async (doctorId: string, date: string) => {
			if (!doctorId || !date) {
				setAvailableTimeSlots([])
				return
			}
			setLoadingTimeSlots(true)
			try {
				const data = await getAvailableTimeSlots(doctorId, date)
				setAvailableTimeSlots(data.availableSlots || [])
			} catch (error) {
				console.error("Error loading available time slots:", error)
				setAvailableTimeSlots([])
				// Si no hay slots disponibles configurados, permitir cualquier hora (backward compatibility)
			} finally {
				setLoadingTimeSlots(false)
			}
		},
		[],
	)

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
						const formattedPatients = patientsData.patients.map(
							(p: Patient) => {
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
							},
						)
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

			const justDate = localDateTime.split("T")[0]
			loadAvailableTimeSlots(editingAppointment.doctor_id, justDate)
			setFormData({
				patient_id: editingAppointment.patient_id,
				doctor_id: editingAppointment.doctor_id,
				appointment_date: localDateTime,
				status: editingAppointment.status,
				notes: editingAppointment.notes || "",
				service_id: editingAppointment.service_id || null,
			})
			// Cargar servicios si hay doctor_id
			if (editingAppointment.doctor_id) {
				loadServices(editingAppointment.doctor_id)
			}
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
	}, [editingAppointment, user, loadServices, loadAvailableTimeSlots])

	const isDateDisabled = (current: Dayjs) => {
		// 1. Bloquear fechas pasadas
		if (current && current < dayjs().startOf("day")) return true

		// Si no hay médico seleccionado, bloqueamos todo para forzar la selección del médico primero
		if (!formData.doctor_id) return true

		// Si aún está cargando o no hay disponibilidad configurada, bloqueamos por seguridad
		if (availability.length === 0) return true

		// 2. Bloquear si el día de la semana no está en la disponibilidad
		// dayjs.day() retorna: 0 (Dom), 1 (Lun), 2 (Mar), 3 (Mie), 4 (Jue), 5 (Vie), 6 (Sab)
		const dayOfWeek = current.day()

		const isAvailableDay = availability.some(
			(a) => Number(a.day_of_week) === dayOfWeek,
		)

		if (!isAvailableDay) return true

		// 3. Bloquear si cae en un rango de No Disponibilidad (vacaciones/bajas)
		const isInsideUnavailability = unavailability.some((u) => {
			// 1. Forzamos la creación de objetos dayjs sin que la zona horaria afecte el día
			// Usamos el formato exacto que viene de tu DB
			const start = dayjs(u.start_date).startOf("day")
			const end = dayjs(u.end_date).endOf("day")

			// 2. Comparamos solo por el componente 'day' para ignorar horas/minutos
			// Esto es equivalente a isSameOrAfter pero más estricto con la granularidad
			const isAfterOrEqual =
				current.isAfter(start, "day") || current.isSame(start, "day")
			const isBeforeOrEqual =
				current.isBefore(end, "day") || current.isSame(end, "day")

			return isAfterOrEqual && isBeforeOrEqual
		})

		return isInsideUnavailability
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)

		try {
			const appointmentData: AppointmentFormData = {
				...formData,
				appointment_date: dayjs(formData.appointment_date).format(
					"YYYY-MM-DD HH:mm:ss",
				),
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
									onChange={(e) => {
										const doctorId = e.target.value
										const currentDate =
											formData.appointment_date.split("T")[0] || ""
										setFormData({
											...formData,
											doctor_id: doctorId,
											service_id: null,
										})
										loadServices(doctorId)
										setSelectedService(null)
										// Cargar slots disponibles si hay fecha seleccionada
										if (currentDate) {
											loadAvailableTimeSlots(doctorId, currentDate)
										}
									}}
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

						{/* Servicio - Solo visible si hay doctor seleccionado */}
						{formData.doctor_id && services.length > 0 && (
							<div className="md:col-span-2 relative">
								<label
									htmlFor="service_id"
									className="text-xs font-bold text-gray-700 mb-1 block ml-1"
								>
									Servicio (Opcional)
								</label>
								<select
									id="service_id"
									value={formData.service_id?.toString() || ""}
									className={inputClass}
									onChange={(e) => {
										const serviceId = e.target.value
											? parseInt(e.target.value, 10)
											: null
										const service = services.find((s) => s.id === serviceId)
										setFormData({ ...formData, service_id: serviceId })
										setSelectedService(service || null)
									}}
								>
									<option value="">Seleccionar servicio...</option>
									{services.map((service) => (
										<option key={service.id} value={service.id}>
											{service.service_type.name} - $
											{formatPrice(service.price_usd)} USD
										</option>
									))}
								</select>
								{selectedService && (
									<div className="mt-2 p-3 bg-blue-50 rounded-lg">
										<div className="text-sm">
											<div className="flex justify-between mb-1">
												<span className="text-gray-600">Precio USD:</span>
												<span className="font-semibold text-primary">
													${formatPrice(selectedService.price_usd)}
												</span>
											</div>
											{(settings?.custom_exchange_rate ||
												currencyRates?.oficial?.promedio) && (
												<div className="flex justify-between">
													<span className="text-gray-600">Precio BS:</span>
													<span className="font-semibold text-green-600">
														Bs.{" "}
														{formatPrice(
															selectedService.price_usd *
																(settings?.custom_exchange_rate ||
																	currencyRates?.oficial?.promedio ||
																	0),
														)}
													</span>
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						)}

						{/* Fecha */}
						<div>
							<label className="text-xs font-bold text-gray-700 mb-1 block ml-1">
								Fecha *
							</label>
							<DatePicker
								value={
									formData.appointment_date
										? dayjs(formData.appointment_date.split("T")[0])
										: null
								}
								onChange={(date: Dayjs | null) => {
									if (date) {
										const dateStr = date.format("YYYY-MM-DD")
										const currentTime =
											formData.appointment_date.split("T")[1] || "09:00"
										setFormData({
											...formData,
											appointment_date: `${dateStr}T${currentTime}`,
										})
										// Cargar slots disponibles cuando cambia la fecha
										if (formData.doctor_id) {
											loadAvailableTimeSlots(formData.doctor_id, dateStr)
										}
									}
								}}
								format="DD/MM/YYYY"
								className="w-full"
								placeholder="Seleccionar fecha"
								disabled={!formData.doctor_id} // No dejar elegir fecha sin médico
								disabledDate={isDateDisabled}
							/>
						</div>

						{/* Hora */}
						<div>
							<label className="text-xs font-bold text-gray-700 mb-1 block ml-1">
								Hora *
							</label>
							{formData.doctor_id &&
							formData.appointment_date.split("T")[0] &&
							availableTimeSlots.length > 0 ? (
								<Select
									value={formData.appointment_date.split("T")[1] || undefined}
									onChange={(time) => {
										const date = formData.appointment_date.split("T")[0] || ""
										setFormData({
											...formData,
											appointment_date: `${date}T${time}`,
										})
									}}
									className="w-full"
									placeholder={
										loadingTimeSlots
											? "Cargando..."
											: "Seleccionar hora disponible"
									}
									loading={loadingTimeSlots}
									options={availableTimeSlots.map((slot) => ({
										value: slot,
										label: slot,
									}))}
								/>
							) : (
								<TimePicker
									value={
										formData.appointment_date.split("T")[1]
											? dayjs(formData.appointment_date.split("T")[1], "HH:mm")
											: null
									}
									onChange={(time: Dayjs | null) => {
										const date = formData.appointment_date.split("T")[0] || ""
										const timeStr = time ? time.format("HH:mm") : "09:00"
										setFormData({
											...formData,
											appointment_date: `${date}T${timeStr}`,
										})
									}}
									format="HH:mm"
									className="w-full"
									placeholder="Seleccionar hora"
									disabled={
										!formData.appointment_date ||
										availableTimeSlots.length === 0
									}
									minuteStep={30}
								/>
							)}
							{formData.doctor_id &&
								formData.appointment_date.split("T")[0] &&
								availableTimeSlots.length === 0 &&
								!loadingTimeSlots && (
									<p className="text-xs text-gray-500 mt-1">
										No hay horarios disponibles para este día.
									</p>
								)}
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

import { DatePicker, Input, Select, TimePicker } from "antd"
import type { Dayjs } from "dayjs"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { FaSave, FaTimes, FaUser, FaUserMd } from "react-icons/fa"
import "dayjs/locale/es"
import { toast } from "react-toastify"
import type { Appointment, AppointmentFormData, Patient } from "../../../shared"
import { Button, formatPrice } from "../../../shared"
import type { Doctor } from "../../../types"
import { useAuth } from "../../auth"
import {
	type CurrencyRates,
	getCurrencyRates,
} from "../../currency/services/CurrencyAPI"
import { getPatients, getDoctorPatients } from "../../patients"
import { getDoctors } from "../../patients/services/UsersAPI"
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
	const [currencyRates, setCurrencyRates] = useState<CurrencyRates | null>(null)
	const [selectedService, setSelectedService] =
		useState<DoctorServiceWithType | null>(null)

	const isDoctor = user?.role === "Médico"
	const isAdmin = user?.role === "Admin"
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

	// Preparamos las opciones antes del JSX
	const patientOptions = patients.map((p) => ({
		value: p.document_id,
		label: `${p.first_name} ${p.last_name} - ${p.document_id}`,
	}))

	const doctorOptions = doctors.map((doctor) => ({
		value: doctor.document_id,
		label: `${doctor.name} - ${doctor.document_id}`,
	}))

	const serviceOptions = services.map((s) => ({
		value: s.id,
		label: `${s.service_type.name} - $${formatPrice(s.price_usd)} USD`,
	}))

	const statusOptions = [
		{ value: "pending", label: "Pendiente" },
		{ value: "scheduled", label: "Programada" },
		{ value: "cancelled", label: "Cancelada" },
		{ value: "completed", label: "Completada" },
	]

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

	const loadPatientsAndDoctors = useCallback(async () => {
		setLoadingData(true)

		try {
			// Cargar pacientes: Médico solo ve los asignados a él; Admin ve todos
			if (isDoctor || isAdmin) {
				const patientsData = isDoctor
					? await getDoctorPatients()
					: await getPatients()
				const list = patientsData?.patients ?? []
				const formattedPatients = list.map((p: Patient) => ({
					...p,
					birthdate: p.birthdate ? new Date(p.birthdate) : new Date(),
				}))
				setPatients(formattedPatients)
			}

			// Cargar doctores (Admin siempre los necesita, Paciente también)
			// Solo el Médico se salta esto porque ya es "él mismo"
			if (!isDoctor || isAdmin) {
				const doctorsData = await getDoctors()
				if (doctorsData?.doctors) {
					setDoctors(doctorsData.doctors)
				}
			}
		} catch (error) {
			console.error("Error cargando datos:", error)
			toast.error("Error al cargar las listas de selección")
		} finally {
			setLoadingData(false)
		}
	}, [isAdmin, isDoctor])

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
				loadServices(user.document_id)
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
					<Button
						type="button"
						variant="text"
						onClick={onClose}
						className="hover:bg-white/20 !p-2 rounded-full"
					>
						<FaTimes size={20} />
					</Button>
				</div>

				{/* Formulario */}
				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-3xl shadow-lg">
						{/* Paciente - Visible para Médicos y Admins */}
						{(isDoctor || isAdmin) && (
							<div className="md:col-span-2 relative">
								<label
									htmlFor="patient_id"
									className="text-xs font-bold text-gray-700 mb-1 block ml-1"
								>
									Paciente *
								</label>
								<FaUser className="absolute left-3 bottom-3 text-gray-400" />
								<Select
									showSearch // Permite escribir para filtrar
									id="patient_id"
									placeholder="Seleccionar paciente..."
									loading={loadingData}
									disabled={loadingData}
									value={formData.patient_id || undefined} // AntD prefiere undefined sobre "" para mostrar el placeholder
									className="w-full" // Usamos Tailwind para el ancho
									style={{ height: "42px" }} // Altura para que coincida con tus otros inputs
									onChange={(value) =>
										setFormData({ ...formData, patient_id: value })
									}
									options={patientOptions}
									// Lógica de búsqueda: busca tanto en nombre como en documento
									filterOption={(input, option) =>
										(option?.label ?? "")
											.toLowerCase()
											.includes(input.toLowerCase())
									}
								/>
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
								<Select
									showSearch
									id="doctor_id"
									placeholder="Seleccionar médico..."
									loading={loadingData}
									disabled={loadingData}
									value={formData.doctor_id || undefined}
									className="w-full"
									style={{ height: "42px" }}
									options={doctorOptions}
									// Lógica para filtrar mientras escribes
									filterOption={(input, option) =>
										(option?.label ?? "")
											.toLowerCase()
											.includes(input.toLowerCase())
									}
									onChange={(value) => {
										const doctorId = value
										const currentDate =
											formData.appointment_date?.split("T")[0] || ""

										// Actualizamos estado
										setFormData({
											...formData,
											doctor_id: doctorId,
											service_id: null,
										})

										// Disparamos efectos secundarios
										loadServices(doctorId)
										setSelectedService(null)

										// Si ya hay una fecha, refrescamos los horarios disponibles del nuevo médico
										if (currentDate) {
											loadAvailableTimeSlots(doctorId, currentDate)
										}
									}}
								/>
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
								<Select
									id="service_id"
									placeholder="Seleccionar servicio..."
									value={formData.service_id || undefined} // AntD usa undefined para resetear al placeholder
									className="w-full"
									style={{ height: "42px" }}
									options={serviceOptions}
									onChange={(value) => {
										// value ya viene como número o undefined, no necesitas parseInt
										const serviceId = value || null
										const service = services.find((s) => s.id === serviceId)

										setFormData({ ...formData, service_id: serviceId })
										setSelectedService(service || null)
									}}
									// Si quieres que el usuario pueda borrar la selección fácilmente
									allowClear
									// Para que herede el estilo de búsqueda si la lista es larga
									showSearch
									filterOption={(input, option) =>
										(option?.label ?? "")
											.toLowerCase()
											.includes(input.toLowerCase())
									}
								/>
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
							<label
								htmlFor="date"
								className="text-xs font-bold text-gray-700 mb-1 block ml-1"
							>
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
							<label
								htmlFor="time"
								className="text-xs font-bold text-gray-700 mb-1 block ml-1"
							>
								Hora *
							</label>
							{formData.doctor_id &&
							formData.appointment_date.split("T")[0] &&
							availableTimeSlots.length > 0 ? (
								<Select
									id="time"
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
						{(isDoctor || isAdmin) && (
							<div className="relative">
								<label
									htmlFor="status"
									className="text-xs font-bold text-gray-700 mb-1 block ml-1"
								>
									Estado
								</label>
								<Select
									id="status"
									value={formData.status}
									className="w-full"
									style={{ height: "42px" }}
									options={statusOptions}
									onChange={(value) =>
										setFormData({
											...formData,
											status: value, // AntD ya infiere el tipo si usas TypeScript correctamente
										})
									}
									// Opcional: añade colores de fondo según el estado elegido
									dropdownStyle={{ borderRadius: "8px" }}
								/>
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
							<Input.TextArea
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
						<Button
							type="button"
							variant="default"
							onClick={onClose}
							className="flex-1 !py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl"
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							disabled={loading || loadingData}
							loading={loading}
							icon={<FaSave />}
							className="flex-1 !py-3 font-bold rounded-2xl"
						>
							{editingAppointment ? "Actualizar" : "Crear"} Cita
						</Button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default AppointmentModal

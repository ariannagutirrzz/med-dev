import { DatePicker, Select, TimePicker } from "antd"
import type { Dayjs } from "dayjs"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
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
import type { Doctor } from "../../../types"
import { useAuth } from "../../auth"
import { getCurrencyRates } from "../../currency/services/CurrencyAPI"
import { getPatients } from "../../patients"
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
import { getAvailableTimeSlots } from "../services/DoctorAvailabilityAPI"

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
	const [currencyRates, setCurrencyRates] = useState<any>(null)
	const [selectedService, setSelectedService] =
		useState<DoctorServiceWithType | null>(null)

	const isDoctor = user?.role === "Médico"
	const isAdmin = user?.role === "Admin"
	const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
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
			// Cargar pacientes si es Médico O Admin
			if (isDoctor || isAdmin) {
				const patientsData = await getPatients()
				if (patientsData?.patients) {
					const formattedPatients = patientsData.patients.map((p: Patient) => ({
						...p,
						birthdate: p.birthdate ? new Date(p.birthdate) : new Date(),
					}))
					setPatients(formattedPatients)
				}
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
	}, [editingAppointment, loadServices, user])

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
								<select
									id="patient_id"
									value={formData.patient_id}
									required
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
								disabledDate={(current) =>
									current && current < dayjs().startOf("day")
								}
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
									minuteStep={30}
								/>
							)}
							{formData.doctor_id &&
								formData.appointment_date.split("T")[0] &&
								availableTimeSlots.length === 0 &&
								!loadingTimeSlots && (
									<p className="text-xs text-gray-500 mt-1">
										No hay horarios disponibles configurados para este día.
										Puede seleccionar cualquier hora.
									</p>
								)}
						</div>

						{/* Estado - Solo editable por médicos */}
						{isDoctor ||
							(isAdmin && (
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
							))}

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

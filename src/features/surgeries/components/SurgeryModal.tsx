import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { FaCalendar, FaClock, FaSave, FaTimes, FaUser, FaStethoscope } from "react-icons/fa"
import { toast } from "react-toastify"
import { useAuth } from "../../auth"
import {
	createSurgery,
	updateSurgeryById,
} from "../services/SurgeriesAPI"
import { getPatients } from "../../patients"
import { getMyServices } from "../../services"
import { getSettings, type UserSettings } from "../../settings/services/SettingsAPI"
import { getCurrencyRates } from "../../currency/services/CurrencyAPI"
import type { Surgery, SurgeryFormData, Patient } from "../../../shared"
import type { DoctorServiceWithType } from "../../services"
import { formatPrice } from "../../../shared"

interface SurgeryModalProps {
	isOpen: boolean
	onClose: () => void
	onSuccess: () => void
	editingSurgery?: Surgery | null
}

const SurgeryModal: React.FC<SurgeryModalProps> = ({
	isOpen,
	onClose,
	onSuccess,
	editingSurgery,
}) => {
	const { user } = useAuth()
	const [loading, setLoading] = useState(false)
	const [patients, setPatients] = useState<Patient[]>([])
	const [loadingData, setLoadingData] = useState(false)
	const [services, setServices] = useState<DoctorServiceWithType[]>([])
	const [settings, setSettings] = useState<UserSettings | null>(null)
	const [currencyRates, setCurrencyRates] = useState<any>(null)
	const [selectedService, setSelectedService] = useState<DoctorServiceWithType | null>(null)

	const initialValues: SurgeryFormData = {
		patient_id: "",
		surgery_date: "",
		surgery_type: "",
		status: "scheduled",
		notes: "",
		service_id: null,
	}

	const [formData, setFormData] = useState<SurgeryFormData>(initialValues)

	// Cargar servicios del médico
	const loadServices = useCallback(async () => {
		try {
			const [servicesData, settingsData, ratesData] = await Promise.all([
				getMyServices(),
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

	// Cargar pacientes
	const loadPatients = useCallback(async () => {
		setLoadingData(true)
		try {
			const patientsData = await getPatients()
			if (patientsData?.patients) {
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
		} catch (error) {
			console.error("Error cargando pacientes:", error)
			setPatients([])
		} finally {
			setLoadingData(false)
		}
	}, [])

	useEffect(() => {
		if (isOpen) {
			loadPatients()
			loadServices()
		}
	}, [isOpen, loadPatients, loadServices])

	// Cargar datos de la cirugía si es edición
	useEffect(() => {
		if (editingSurgery) {
			// Convertir surgery_date de ISO string a formato datetime-local
			const surgeryDate = new Date(editingSurgery.surgery_date)
			const localDateTime = new Date(
				surgeryDate.getTime() - surgeryDate.getTimezoneOffset() * 60000,
			)
				.toISOString()
				.slice(0, 16) // Formato YYYY-MM-DDTHH:mm

			setFormData({
				patient_id: editingSurgery.patient_id,
				surgery_date: localDateTime,
				surgery_type: editingSurgery.surgery_type,
				status: editingSurgery.status,
				notes: editingSurgery.notes || "",
				service_id: editingSurgery.service_id || null,
			})
			// Cargar servicios y seleccionar el servicio si existe
			loadServices().then(() => {
				if (editingSurgery.service_id) {
					const service = services.find((s) => s.id === editingSurgery.service_id)
					setSelectedService(service || null)
				}
			})
		} else {
			setFormData(initialValues)
		}
	}, [editingSurgery])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)

		try {
			// Convertir fecha local a ISO string para el backend
			const dateTime = new Date(formData.surgery_date)
			const isoDateTime = dateTime.toISOString()

			const surgeryData: SurgeryFormData = {
				...formData,
				surgery_date: isoDateTime,
			}

			if (editingSurgery) {
				// Actualizar cirugía existente
				await updateSurgeryById(editingSurgery.id, surgeryData)
				toast.success("Cirugía actualizada con éxito")
			} else {
				// Crear nueva cirugía
				await createSurgery(surgeryData)
				toast.success("Cirugía programada correctamente")
			}

			onSuccess()
			onClose()
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Error al procesar la cirugía",
			)
		} finally {
			setLoading(false)
		}
	}

	if (!isOpen) return null

	const inputClass =
		"w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"

	const surgeryTypes = [
		"Cirugía Mayor",
		"Cirugía Menor",
		"Cirugía Programada",
		"Cirugía de Emergencia",
		"Cirugía Ambulatoria",
		"Laparoscopia",
		"Toracoscopia",
		"Biopsia",
		"Otro",
	]

	const statusOptions = [
		{ value: "scheduled", label: "Programada" },
		{ value: "in_progress", label: "En Progreso" },
		{ value: "completed", label: "Completada" },
		{ value: "cancelled", label: "Cancelada" },
		{ value: "postponed", label: "Aplazada" },
	]

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 w-full bg-black/90 backdrop-blur-sm">
			<div className="bg-gray-100 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
				{/* Header del Modal */}
				<div className="p-6 flex justify-between items-center">
					<div>
						<h2 className="text-xl font-bold text-gray-800">
							{editingSurgery ? "Editar Cirugía" : "Nueva Reserva de Cirugía"}
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
						{/* Paciente */}
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

						{/* Servicio - Opcional, pero si se selecciona, actualiza el tipo de cirugía */}
						{services.length > 0 && (
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
										const serviceId = e.target.value ? parseInt(e.target.value, 10) : null
										const service = services.find((s) => s.id === serviceId)
										setFormData({
											...formData,
											service_id: serviceId,
											surgery_type: service?.service_type.name || formData.surgery_type,
										})
										setSelectedService(service || null)
									}}
								>
									<option value="">Seleccionar servicio...</option>
									{services.map((service) => (
										<option key={service.id} value={service.id}>
											{service.service_type.name} - ${formatPrice(service.price_usd)} USD
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
											{(settings?.custom_exchange_rate || currencyRates?.oficial?.promedio) && (
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

						{/* Tipo de Cirugía */}
						<div className="md:col-span-2 relative">
							<label
								htmlFor="surgery_type"
								className="text-xs font-bold text-gray-700 mb-1 block ml-1"
							>
								Tipo de Cirugía *
							</label>
							<FaStethoscope className="absolute left-3 bottom-3 text-gray-400" />
							<select
								id="surgery_type"
								value={formData.surgery_type}
								required
								className={inputClass}
								onChange={(e) =>
									setFormData({ ...formData, surgery_type: e.target.value })
								}
							>
								<option value="">Seleccionar tipo de cirugía...</option>
								{surgeryTypes.map((type) => (
									<option key={type} value={type}>
										{type}
									</option>
								))}
							</select>
						</div>

						{/* Fecha */}
						<div className="relative">
							<label
								htmlFor="surgery_date"
								className="text-xs font-bold text-gray-700 mb-1 block ml-1"
							>
								Fecha *
							</label>
							<FaCalendar className="absolute left-3 bottom-3 text-gray-400" />
							<input
								id="surgery_date"
								type="date"
								value={formData.surgery_date.split("T")[0] || ""}
								required
								className={inputClass}
								onChange={(e) => {
									const date = e.target.value
									const time = formData.surgery_date.split("T")[1] || "09:00"
									setFormData({
										...formData,
										surgery_date: `${date}T${time}`,
									})
								}}
							/>
						</div>

						{/* Hora */}
						<div className="relative">
							<label
								htmlFor="surgery_time"
								className="text-xs font-bold text-gray-700 mb-1 block ml-1"
							>
								Hora *
							</label>
							<FaClock className="absolute left-3 bottom-3 text-gray-400" />
							<input
								id="surgery_time"
								type="time"
								value={formData.surgery_date.split("T")[1] || "09:00"}
								required
								className={inputClass}
								onChange={(e) => {
									const time = e.target.value
									const date = formData.surgery_date.split("T")[0] || ""
									setFormData({
										...formData,
										surgery_date: `${date}T${time}`,
									})
								}}
							/>
						</div>

						{/* Estado */}
						<div className="relative">
							<label
								htmlFor="status"
								className="text-xs font-bold text-gray-700 mb-1 block ml-1"
							>
								Estado
							</label>
							<select
								id="status"
								value={formData.status || "scheduled"}
								className={inputClass}
								onChange={(e) =>
									setFormData({ ...formData, status: e.target.value })
								}
							>
								{statusOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>

						{/* Notas */}
						<div className="md:col-span-2">
							<label
								htmlFor="notes"
								className="text-xs font-bold text-gray-700 mb-1 block ml-1"
							>
								Notas / Observaciones
							</label>
							<textarea
								id="notes"
								rows={3}
								value={formData.notes || ""}
								className={inputClass}
								placeholder="Notas adicionales sobre la cirugía..."
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
									<FaSave /> {editingSurgery ? "Actualizar" : "Programar"} Cirugía
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default SurgeryModal

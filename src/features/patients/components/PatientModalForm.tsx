import { DatePicker, Input, Select } from "antd"
import dayjs from "dayjs"
import type React from "react"
import { useEffect, useState } from "react"
import {
	FaCalendarAlt,
	FaEnvelope,
	FaExclamationTriangle,
	FaIdCard,
	FaMapMarkerAlt,
	FaPhone,
	FaSave,
	FaTimes,
	FaTrash, // Añadido para el botón de eliminar
	FaUser,
	FaUserPlus,
	FaVenusMars,
} from "react-icons/fa"
import { toast } from "react-toastify"
import type { Patient, PatientFormData } from "../../../shared"
import { ConfirmModal, PhoneInput } from "../../../shared"
import {
	isValidPhone,
	parsePhoneToE164,
} from "../../../shared/utils/phoneFormat"
import {
	createPatient,
	deletePatientById,
	updatePatientById,
} from "../services/PatientsAPI"

interface PatientModalFormProps {
	isOpen: boolean
	onClose: () => void
	patient: Patient | null
	onSave: () => void
}

const PatientModalForm = ({
	isOpen,
	onClose,
	patient,
	onSave,
}: PatientModalFormProps) => {
	const [formData, setFormData] = useState<PatientFormData | null>(null)
	const [loading, setLoading] = useState(false)
	const [allergyInput, setAllergyInput] = useState("")

	// Estado para controlar el modal de confirmación
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

	// Inicializar o limpiar el formulario
	useEffect(() => {
		if (patient) {
			setFormData({
				...patient,
				birthdate: patient.birthdate.toISOString().split("T")[0],
				allergies: patient.allergies,
			})
		} else {
			setFormData({
				first_name: "",
				last_name: "",
				email: "",
				phone: "",
				birthdate: new Date().toISOString().split("T")[0],
				gender: "M",
				address: "",
				document_id: "",
				blood_type: "",
				allergies: [],
			})
		}
	}, [patient])

	// --- Lógica de Alergias ---
	const addAllergy = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && allergyInput.trim() !== "") {
			e.preventDefault()

			setFormData((prev) => {
				if (!prev) return null
				// Nos aseguramos de que currentAllergies sea un array antes de procesar
				const currentAllergies = prev.allergies || []

				if (currentAllergies.includes(allergyInput.trim())) {
					toast.warning("Esta alergia ya está registrada")
					return prev
				}

				return {
					...prev,
					allergies: [...currentAllergies, allergyInput.trim()],
				}
			})
			setAllergyInput("")
		}
	}

	const removeAllergy = (indexToRemove: number) => {
		setFormData((prev) =>
			prev
				? {
						...prev,
						allergies: prev.allergies.filter(
							(_, index) => index !== indexToRemove,
						),
					}
				: null,
		)
	}

	// Lógica de Validación
	const validateFields = (data: PatientFormData) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

		if (!emailRegex.test(data.email)) {
			toast.error("El formato del correo electrónico no es válido")
			return false
		}

		if (!data.phone?.trim()) {
			toast.error("El teléfono es requerido")
			return false
		}
		if (!isValidPhone(data.phone)) {
			toast.error(
				"El número de teléfono debe tener formato válido (+58 4XX XXX XXXX)",
			)
			return false
		}

		if (new Date(data.birthdate) > new Date()) {
			toast.error("La fecha de nacimiento no puede ser una fecha futura")
			return false
		}

		return true
	}

	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const { name, value } = e.target
		setFormData((prev) => {
			if (!prev) return null
			return { ...prev, [name]: value }
		})
	}

	const handlePhoneChange = (e164Value: string) => {
		setFormData((prev) => (prev ? { ...prev, phone: e164Value } : null))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!formData) return
		if (!validateFields(formData)) return

		setLoading(true)
		try {
			const payload = { ...formData, phone: parsePhoneToE164(formData.phone) }
			if (patient) {
				await updatePatientById(payload)
				toast.success("Información actualizada correctamente")
			} else {
				await createPatient(payload)
				toast.success("Paciente registrado exitosamente")
			}
			onSave()
			onClose()
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Error al procesar la solicitud"
			toast.error(message)
		} finally {
			setLoading(false)
		}
	}

	// Función para manejar la eliminación (lógica a implementar a futuro)
	const handleDelete = async () => {
		try {
			patient && (await deletePatientById(patient.document_id))
			toast.success("Paciente eliminado correctamente")
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Error al eliminar el paciente"
			toast.error(message)
		}
		setShowDeleteConfirm(false)
		onClose()
		onSave()
	}

	if (!isOpen || !formData) return null

	const labelClass =
		"text-xs font-black text-primary uppercase tracking-wider mb-2 flex items-center gap-2"
	const inputBaseClass =
		"w-full bg-gray-50! p-3 rounded-xl! border border-gray-100 text-gray-700 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none disabled:opacity-60"

	return (
		<>
			<div className="fixed inset-0 z-70 flex items-center justify-center p-4 w-full bg-black/80 backdrop-blur-sm">
				<div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
					{/* Header */}
					<div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
						<div className="flex items-center gap-4">
							<div className="bg-primary/10 p-3 rounded-2xl text-primary">
								<FaUserPlus size={24} />
							</div>
							<div>
								<h2 className="text-xl font-bold text-gray-800">
									{patient ? "Editar Paciente" : "Nuevo Registro de Paciente"}
								</h2>
								<p className="text-xs font-bold text-gray-400 uppercase">
									{patient
										? `Expediente: ${patient.document_id}`
										: "Información Personal"}
								</p>
							</div>
						</div>
						<button
							type="button"
							onClick={onClose}
							className="hover:bg-gray-200 p-2 rounded-full text-gray-400 cursor-pointer transition-colors"
						>
							<FaTimes />
						</button>
					</div>

					<form onSubmit={handleSubmit}>
						<div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
							{/* 1. Nombres y Apellidos */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex flex-col">
									<label htmlFor="first_name" className={labelClass}>
										<FaUser /> Nombre(s)
									</label>
									<Input
										name="first_name"
										value={formData.first_name}
										onChange={handleInputChange}
										disabled={loading}
										required
										placeholder="Ingresa el nombre"
										className={inputBaseClass}
										style={{ height: "42px" }}
										allowClear
									/>
								</div>
								<div className="flex flex-col">
									<label htmlFor="last_name" className={labelClass}>
										<FaUser /> Apellido(s)
									</label>
									<Input
										name="last_name"
										value={formData.last_name}
										onChange={handleInputChange}
										disabled={loading}
										required
										placeholder="Ingresa el apellido"
										// Aplicamos las clases para el comportamiento de color
										className={inputBaseClass}
										style={{ height: "42px" }}
										allowClear
									/>
								</div>
							</div>

							{/* 2. Documento y Género */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex flex-col">
									<label htmlFor="document_id" className={labelClass}>
										<FaIdCard /> Documento de Identidad
									</label>
									<Input
										name="document_id"
										required
										disabled={loading || !!patient}
										placeholder="12345678"
										className={inputBaseClass}
										style={{ height: "42px" }}
										// IMPORTANTE: Mostramos el valor del estado, pero sin el "V-"
										// (solo por si acaso el estado llegara a tenerlo, lo removemos para la vista)
										value={formData.document_id.replace(/^V-/, "")}
										// El prefijo visual de AntD (fuera del flujo del texto del input)
										prefix={
											<span className="text-gray-400 font-medium">V-</span>
										}
										onChange={(e) => {
											// 1. Tomamos el valor y eliminamos TODO lo que no sea número
											const onlyNumbers = e.target.value.replace(/[^\d]/g, "")

											// 2. Mandamos al estado el valor formateado como tú lo quieres para el submit: "V-" + números
											handleInputChange({
												target: {
													name: "document_id",
													value: `V-${onlyNumbers}`,
												},
											} as React.ChangeEvent<HTMLInputElement>)
										}}
									/>
								</div>
								<div className="flex flex-col">
									<label htmlFor="gender" className={labelClass}>
										<FaVenusMars /> Género
									</label>
									<Select
										id="gender"
										disabled={loading}
										value={formData.gender}
										placeholder="Seleccionar género"
										className="w-full rounded-xl!"
										style={{ height: "42px" }}
										// Definimos las opciones directamente aquí
										options={[
											{ value: "M", label: "Masculino" },
											{ value: "F", label: "Femenino" },
											{ value: "Otro", label: "Otro" },
										]}
										// Adaptamos el handleInputChange para que funcione con AntD
										onChange={(value) => {
											handleInputChange({
												target: { name: "gender", value },
											} as React.ChangeEvent<HTMLInputElement>)
										}}
									/>
								</div>
							</div>

							{/* 3. Contacto */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex flex-col">
									<label htmlFor="email" className={labelClass}>
										<FaEnvelope /> Correo Electrónico
									</label>
									<Input
										type="email"
										name="email"
										required
										disabled={loading}
										placeholder="ejemplo@correo.com"
										className={inputBaseClass}
										value={formData.email}
										onChange={handleInputChange}
										allowClear
										// Aseguramos que el estilo de AntD no choque con tu p-3
										style={{ height: "42px" }}
									/>
								</div>
								<div className="flex flex-col">
									<label htmlFor="phone" className={labelClass}>
										<FaPhone /> Teléfono
									</label>
									<PhoneInput
										value={formData.phone}
										onChange={handlePhoneChange}
										placeholder="4XX XXX XXXX"
										disabled={loading}
										className={inputBaseClass}
									/>
								</div>
							</div>

							{/* 4. Fecha de Nacimiento y Tipo de Sangre */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex flex-col">
									<label htmlFor="birthdate" className={labelClass}>
										<FaCalendarAlt /> Fecha de Nacimiento
									</label>
									<DatePicker
										name="birthdate"
										placeholder="Seleccionar fecha de nacimiento"
										className={inputBaseClass}
										style={{ height: "42px" }} // Para mantener la armonía con los otros campos
										disabled={loading}
										format="DD/MM/YYYY"
										// AntD espera un objeto Dayjs. Si el string está vacío, mandamos null.
										value={
											formData.birthdate ? dayjs(formData.birthdate) : null
										}
										// Bloqueamos fechas futuras (nadie puede nacer mañana)
										disabledDate={(current) =>
											current && current > dayjs().endOf("day")
										}
										onChange={(date) => {
											const dateString = date ? date.format("YYYY-MM-DD") : ""

											// Simulamos el evento para tu handleInputChange
											handleInputChange({
												target: {
													name: "birthdate",
													value: dateString,
												},
											} as React.ChangeEvent<HTMLInputElement>)
										}}
									/>
								</div>
								<div className="flex flex-col">
									<label htmlFor="blood_type" className={labelClass}>
										<FaVenusMars /> Tipo de Sangre
									</label>
									<Select
										id="blood_type"
										placeholder="Seleccionar..."
										disabled={loading}
										// Usamos undefined para que se muestre el placeholder correctamente
										value={formData.blood_type || undefined}
										className={inputBaseClass}
										style={{
											height: "42px",
											display: "flex",
											alignItems: "center",
										}}
										// Definimos las opciones inline
										options={[
											{ value: "A+", label: "A+" },
											{ value: "A-", label: "A-" },
											{ value: "B+", label: "B+" },
											{ value: "B-", label: "B-" },
											{ value: "AB+", label: "AB+" },
											{ value: "AB-", label: "AB-" },
											{ value: "O+", label: "O+" },
											{ value: "O-", label: "O-" },
										]}
										// Adaptamos el valor al manejador que ya tienes
										onChange={(value) => {
											handleInputChange({
												target: { name: "blood_type", value },
											} as React.ChangeEvent<HTMLInputElement>)
										}}
										// Permite al usuario borrar la selección
										allowClear
									/>
								</div>
							</div>

							{/* 5. Alergias (Nueva Sección) */}
							<div className="flex flex-col">
								<label htmlFor="allergies" className={labelClass}>
									<FaExclamationTriangle /> Alergias
								</label>
								<div className="space-y-3">
									<input
										id="allergies"
										type="text"
										placeholder="Escribe una alergia y presiona Enter..."
										className={inputBaseClass}
										value={allergyInput}
										onChange={(e) => setAllergyInput(e.target.value)}
										onKeyDown={addAllergy}
										disabled={loading}
									/>

									{/* Contenedor de Tags */}
									<div className="flex flex-wrap gap-2">
										{formData.allergies?.length === 0 ? (
											<span className="text-xs text-gray-400 italic">
												No se han registrado alergias.
											</span>
										) : (
											formData.allergies?.map((allergy, index) => (
												<div
													key={allergy}
													className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-100 text-sm font-medium animate-in fade-in slide-in-from-left-2"
												>
													{allergy}
													<button
														type="button"
														onClick={() => removeAllergy(index)}
														className="hover:text-red-900 transition-colors"
													>
														<FaTimes size={12} />
													</button>
												</div>
											))
										)}
									</div>
								</div>
							</div>

							{/* 6. Dirección */}
							<div className="flex flex-col">
								<label htmlFor="address" className={labelClass}>
									<FaMapMarkerAlt /> Dirección de Habitación
								</label>
								<textarea
									name="address"
									rows={2}
									disabled={loading}
									className={inputBaseClass}
									value={formData.address}
									onChange={handleInputChange}
									placeholder="Ciudad, Municipio, Calle..."
								/>
							</div>
						</div>

						{/* Footer con acciones */}
						<div className="p-6 bg-gray-50 flex flex-wrap justify-between items-center gap-3">
							{/* Botón de eliminar (sólo si se está editando) */}
							<div>
								{patient && (
									<button
										type="button"
										onClick={() => setShowDeleteConfirm(true)}
										className="px-4 py-2 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-all flex items-center gap-2 group cursor-pointer"
									>
										<FaTrash className="group-hover:shake" />
										<span>Eliminar Paciente</span>
									</button>
								)}
							</div>

							<div className="flex gap-3">
								<button
									type="button"
									onClick={onClose}
									disabled={loading}
									className="px-6 py-3 cursor-pointer bg-white border-2 border-gray-200 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-all disabled:opacity-50"
								>
									Cancelar
								</button>
								<button
									type="submit"
									disabled={loading}
									className="px-8 py-3 bg-primary cursor-pointer text-white font-bold rounded-2xl hover:bg-primary-dark transition-all shadow-lg flex items-center gap-2 disabled:bg-primary/50 disabled:cursor-wait"
								>
									{loading ? (
										<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
									) : (
										<FaSave />
									)}
									{patient ? "Actualizar Paciente" : "Registrar Paciente"}
								</button>
							</div>
						</div>
					</form>
				</div>
			</div>

			{/* Componente Reutilizable de Confirmación */}
			<ConfirmModal
				isOpen={showDeleteConfirm}
				onClose={() => setShowDeleteConfirm(false)}
				onConfirm={handleDelete}
				title="¿Eliminar registro?"
				message={
					<p>
						Estás a punto de borrar a{" "}
						<strong>
							{formData.first_name} {formData.last_name}
						</strong>
						. Toda su historia médica y datos de contacto se perderán
						permanentemente.
					</p>
				}
				confirmText="Sí, eliminar definitivamente"
				cancelText="No, volver atrás"
				variant="danger"
			/>
		</>
	)
}

export default PatientModalForm

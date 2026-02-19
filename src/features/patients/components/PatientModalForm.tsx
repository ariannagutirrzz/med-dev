import type React from "react"
import { useEffect, useState } from "react"
import {
	FaCalendarAlt,
	FaEnvelope,
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
import {
	createPatient,
	deletePatientById,
	updatePatientById,
} from "../services/PatientsAPI"
import type { Patient, PatientFormData } from "../../../shared"
import { ConfirmModal } from "../../../shared"

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

	// Estado para controlar el modal de confirmación
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

	// Inicializar o limpiar el formulario
	useEffect(() => {
		if (patient) {
			setFormData({
				...patient,
				birthdate: patient.birthdate.toISOString().split("T")[0],
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
			})
		}
	}, [patient])

	// Lógica de Validación
	const validateFields = (data: PatientFormData) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		const phoneRegex =
			/^(\+?\d{1,3})?[-.\s]?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}$/

		if (!emailRegex.test(data.email)) {
			toast.error("El formato del correo electrónico no es válido")
			return false
		}

		if (!phoneRegex.test(data.phone)) {
			toast.error("El número de teléfono debe tener un formato válido")
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!formData) return
		if (!validateFields(formData)) return

		setLoading(true)
		try {
			if (patient) {
				await updatePatientById(formData)
				toast.success("Información actualizada correctamente")
			} else {
				await createPatient(formData)
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
		"w-full bg-gray-50 p-3 rounded-xl border border-gray-100 text-gray-700 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none disabled:opacity-60"

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
									<input
										type="text"
										name="first_name"
										required
										disabled={loading}
										className={inputBaseClass}
										value={formData.first_name}
										onChange={handleInputChange}
									/>
								</div>
								<div className="flex flex-col">
									<label htmlFor="last_name" className={labelClass}>
										<FaUser /> Apellido(s)
									</label>
									<input
										type="text"
										name="last_name"
										required
										disabled={loading}
										className={inputBaseClass}
										value={formData.last_name}
										onChange={handleInputChange}
									/>
								</div>
							</div>

							{/* 2. Documento y Género */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex flex-col">
									<label htmlFor="document_id" className={labelClass}>
										<FaIdCard /> Documento de Identidad
									</label>
									<input
										type="text"
										name="document_id"
										required
										disabled={loading || !!patient}
										placeholder="Ej: V-12.345.678"
										className={inputBaseClass}
										value={formData.document_id}
										onChange={handleInputChange}
									/>
								</div>
								<div className="flex flex-col">
									<label htmlFor="gender" className={labelClass}>
										<FaVenusMars /> Género
									</label>
									<select
										name="gender"
										disabled={loading}
										className={inputBaseClass}
										value={formData.gender}
										onChange={handleInputChange}
									>
										<option value="M">Masculino</option>
										<option value="F">Femenino</option>
										<option value="Otro">Otro</option>
									</select>
								</div>
							</div>

							{/* 3. Contacto */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex flex-col">
									<label htmlFor="email" className={labelClass}>
										<FaEnvelope /> Correo Electrónico
									</label>
									<input
										type="email"
										name="email"
										required
										disabled={loading}
										placeholder="ejemplo@correo.com"
										className={inputBaseClass}
										value={formData.email}
										onChange={handleInputChange}
									/>
								</div>
								<div className="flex flex-col">
									<label htmlFor="phone" className={labelClass}>
										<FaPhone /> Teléfono
									</label>
									<input
										type="tel"
										name="phone"
										required
										disabled={loading}
										placeholder="Ej: 0412-1234567"
										className={inputBaseClass}
										value={formData.phone}
										onChange={handleInputChange}
									/>
								</div>
							</div>

							{/* 4. Fecha de Nacimiento y Tipo de Sangre */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex flex-col">
									<label htmlFor="birthdate" className={labelClass}>
										<FaCalendarAlt /> Fecha de Nacimiento
									</label>
									<input
										type="date"
										name="birthdate"
										required
										disabled={loading}
										className={inputBaseClass}
										value={formData.birthdate}
										onChange={handleInputChange}
									/>
								</div>
								<div className="flex flex-col">
									<label htmlFor="blood_type" className={labelClass}>
										<FaVenusMars /> Tipo de Sangre
									</label>
									<select
										name="blood_type"
										disabled={loading}
										className={inputBaseClass}
										value={formData.blood_type || ""}
										onChange={handleInputChange}
									>
										<option value="">Seleccionar...</option>
										<option value="A+">A+</option>
										<option value="A-">A-</option>
										<option value="B+">B+</option>
										<option value="B-">B-</option>
										<option value="AB+">AB+</option>
										<option value="AB-">AB-</option>
										<option value="O+">O+</option>
										<option value="O-">O-</option>
									</select>
								</div>
							</div>

							{/* 5. Dirección */}
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

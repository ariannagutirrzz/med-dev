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
	FaUser,
	FaUserPlus,
	FaVenusMars,
} from "react-icons/fa"
import type { Patient } from "../../types"

interface PatientModalFormProps {
	isOpen: boolean
	onClose: () => void
	patient: Patient | null // Si es null, estamos creando uno nuevo
	onSave: (patient: Patient) => void
}

const PatientModalForm = ({
	isOpen,
	onClose,
	patient,
	onSave,
}: PatientModalFormProps) => {
	const [formData, setFormData] = useState<Patient | null>(null)

	// Inicializar o limpiar el formulario
	useEffect(() => {
		if (patient) {
			setFormData({ ...patient })
		} else {
			// Valores por defecto para un nuevo paciente
			setFormData({
				id: Math.floor(Math.random() * 10000), // Temporal si no viene de DB
				first_name: "",
				last_name: "",
				email: "",
				phone: "",
				birthdate: new Date(),
				gender: "M",
				address: "",
				document_id: "",
			})
		}
	}, [patient])

	if (!isOpen || !formData) return null

	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const { name, value } = e.target
		setFormData((prev) => {
			if (!prev) return null
			if (name === "birthdate") {
				return { ...prev, birthdate: new Date(value) }
			}
			return { ...prev, [name]: value }
		})
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		onSave(formData)
		onClose()
	}

	const labelClass =
		"text-xs font-black text-primary uppercase tracking-wider mb-2 flex items-center gap-2"
	const inputBaseClass =
		"w-full bg-gray-50 p-3 rounded-xl border border-gray-100 text-gray-700 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"

	return (
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
								{patient ? `ID: ${patient.id}` : "Información Personal"}
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
						{/* 1. Identificación y Nombres */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="flex flex-col">
								<label htmlFor="first_name" className={labelClass}>
									<FaUser /> Nombre(s)
								</label>
								<input
									type="text"
									name="first_name"
									required
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
									className={inputBaseClass}
									value={formData.last_name}
									onChange={handleInputChange}
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="flex flex-col">
								<label htmlFor="document_id" className={labelClass}>
									<FaIdCard /> Documento de Identidad
								</label>
								<input
									type="text"
									name="document_id"
									required
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

						{/* 2. Contacto */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="flex flex-col">
								<label htmlFor="email" className={labelClass}>
									<FaEnvelope /> Correo Electrónico
								</label>
								<input
									type="email"
									name="email"
									required
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
									className={inputBaseClass}
									value={formData.phone}
									onChange={handleInputChange}
								/>
							</div>
						</div>

						{/* 3. Datos Personales */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="flex flex-col">
								<label htmlFor="birthdate" className={labelClass}>
									<FaCalendarAlt /> Fecha de Nacimiento
								</label>
								<input
									type="date"
									name="birthdate"
									required
									className={inputBaseClass}
									value={formData.birthdate.toISOString().split("T")[0]}
									onChange={handleInputChange}
								/>
							</div>
						</div>

						<div className="flex flex-col">
							<label htmlFor="address" className={labelClass}>
								<FaMapMarkerAlt /> Dirección de Habitación
							</label>
							<textarea
								name="address"
								rows={2}
								className={inputBaseClass}
								value={formData.address}
								onChange={handleInputChange}
								placeholder="Ciudad, Municipio, Calle..."
							/>
						</div>
					</div>

					{/* Footer */}
					<div className="p-6 bg-gray-50 flex justify-end gap-3">
						<button
							type="button"
							onClick={onClose}
							className="px-6 py-3 cursor-pointer bg-white border-2 border-gray-200 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-all"
						>
							Cancelar
						</button>
						<button
							type="submit"
							className="px-8 py-3 bg-primary cursor-pointer text-white font-bold rounded-2xl hover:bg-primary-dark transition-all shadow-lg flex items-center gap-2"
						>
							<FaSave />{" "}
							{patient ? "Actualizar Paciente" : "Registrar Paciente"}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default PatientModalForm

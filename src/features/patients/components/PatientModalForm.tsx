import { DatePicker, Input, Select } from "antd"
import dayjs from "dayjs"
import type React from "react"
import { useEffect, useState } from "react"
import { FaSave, FaTimes, FaTrash } from "react-icons/fa"
import { toast } from "react-toastify"
import type { Patient, PatientFormData } from "../../../shared"
import { Button, ConfirmModal, PhoneInput } from "../../../shared"
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

	const labelClass = "text-xs font-bold text-gray-700 mb-1 block ml-1"
	const inputBaseClass =
		"w-full bg-gray-50! p-3 rounded-xl! border border-gray-100 text-gray-700 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none disabled:opacity-60"

	return (
		<>
			<div className="fixed inset-0 z-70 flex items-center justify-center p-4 w-full bg-black/90 backdrop-blur-sm">
				<div className="relative bg-gray-100 w-full my-auto max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
					{/* Header */}
					<div className="p-6 pb-0 flex justify-between items-center">
						<div>
							<h2 className="text-xl font-bold text-gray-800">
								{patient ? "Editar Paciente" : "Nuevo Registro de Paciente"}
							</h2>
						</div>
						<Button
							type="button"
							variant="text"
							onClick={onClose}
							className="hover:bg-white/20 p-2! rounded-full"
						>
							<FaTimes size={20} />
						</Button>
					</div>

					{/* Formulario */}
					<form
						onSubmit={handleSubmit}
						className="p-4 space-y-4 overflow-y-auto flex-1"
					>
						<div className="bg-white p-4 rounded-3xl shadow-lg space-y-4">
							{/* 1. Nombres y Apellidos */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex flex-col">
									<label htmlFor="first_name" className={labelClass}>
										Nombre(s)
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
										Apellido(s)
									</label>
									<Input
										name="last_name"
										value={formData.last_name}
										onChange={handleInputChange}
										disabled={loading}
										required
										placeholder="Ingresa el apellido"
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
										Documento de Identidad
									</label>
									<Input
										name="document_id"
										required
										disabled={loading || !!patient}
										placeholder="12345678"
										className="custom-ant-group"
										maxLength={8}
										value={
											formData.document_id.split("-")[1] ||
											formData.document_id.replace(/^[VJE]-/, "")
										}
										addonBefore={
											<Select
												value={formData.document_id.split("-")[0] || "V"}
												disabled={loading || !!patient}
												className="w-15"
												onChange={(prefix) => {
													const currentNumbers =
														formData.document_id.split("-")[1] || ""
													handleInputChange({
														target: {
															name: "document_id",
															value: `${prefix}-${currentNumbers}`,
														},
													} as React.ChangeEvent<HTMLInputElement>)
												}}
											>
												<Select.Option value="V">V-</Select.Option>
												<Select.Option value="J">J-</Select.Option>
												<Select.Option value="E">E-</Select.Option>
											</Select>
										}
										onChange={(e) => {
											const onlyNumbers = e.target.value
												.replace(/[^\d]/g, "")
												.slice(0, 8)
											const currentPrefix =
												formData.document_id.split("-")[0] || "V"
											handleInputChange({
												target: {
													name: "document_id",
													value: `${currentPrefix}-${onlyNumbers}`,
												},
											} as React.ChangeEvent<HTMLInputElement>)
										}}
									/>
								</div>
								<div className="flex flex-col">
									<label htmlFor="gender" className={labelClass}>
										Género
									</label>
									<Select
										id="gender"
										disabled={loading}
										value={formData.gender}
										placeholder="Seleccionar género"
										className="w-full h-10"
										options={[
											{ value: "M", label: "Masculino" },
											{ value: "F", label: "Femenino" },
											{ value: "Otro", label: "Otro" },
										]}
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
										Correo Electrónico
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
										style={{ height: "42px" }}
									/>
								</div>
								<div className="flex flex-col">
									<label htmlFor="phone" className={labelClass}>
										Teléfono
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
										Fecha de Nacimiento
									</label>
									<DatePicker
										name="birthdate"
										placeholder="Seleccionar fecha de nacimiento"
										className="w-full h-10"
										disabled={loading}
										format="DD/MM/YYYY"
										value={
											formData.birthdate ? dayjs(formData.birthdate) : null
										}
										disabledDate={(current) =>
											current && current > dayjs().endOf("day")
										}
										onChange={(date) => {
											const dateString = date ? date.format("YYYY-MM-DD") : ""
											handleInputChange({
												target: { name: "birthdate", value: dateString },
											} as React.ChangeEvent<HTMLInputElement>)
										}}
									/>
								</div>
								<div className="flex flex-col">
									<label htmlFor="blood_type" className={labelClass}>
										Tipo de Sangre
									</label>
									<Select
										id="blood_type"
										placeholder="Seleccionar..."
										disabled={loading}
										value={formData.blood_type || undefined}
										className="w-full h-10"
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
										onChange={(value) => {
											handleInputChange({
												target: { name: "blood_type", value },
											} as React.ChangeEvent<HTMLInputElement>)
										}}
										allowClear
									/>
								</div>
							</div>

							{/* 5. Alergias */}
							<div className="flex flex-col">
								<label htmlFor="allergies" className={labelClass}>
									Alergias
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
													<Button
														type="button"
														variant="text"
														onClick={() => removeAllergy(index)}
														icon={<FaTimes size={12} />}
														className="p-0! min-h-0! hover:text-red-900!"
													/>
												</div>
											))
										)}
									</div>
								</div>
							</div>

							{/* 6. Dirección */}
							<div className="flex flex-col">
								<label htmlFor="address" className={labelClass}>
									Dirección
								</label>
								<textarea
									name="address"
									rows={3}
									disabled={loading}
									className={inputBaseClass}
									value={formData.address}
									onChange={handleInputChange}
									placeholder="Ciudad, Municipio, Calle..."
								/>
							</div>
						</div>

						{/* Botones de Acción */}
						<div className="flex gap-3 pt-2">
							{patient && (
								<Button
									type="button"
									variant="default"
									danger
									onClick={() => setShowDeleteConfirm(true)}
									icon={<FaTrash />}
									className="py-3! border-2 border-red-200 rounded-2xl"
								>
									Eliminar
								</Button>
							)}
							<Button
								type="button"
								variant="default"
								onClick={onClose}
								disabled={loading}
								className="flex-1 py-3! border-2 border-gray-300 text-gray-700 font-bold rounded-2xl"
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								loading={loading}
								disabled={loading}
								icon={loading ? undefined : <FaSave />}
								className="flex-1 py-3! font-bold rounded-2xl"
							>
								{patient ? "Actualizar" : "Registrar"} Paciente
							</Button>
						</div>
					</form>
				</div>
			</div>

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

import { DatePicker, Input, Select, Space, Tag } from "antd"
import TextArea from "antd/es/input/TextArea"
import { Option } from "antd/es/mentions"
import dayjs from "dayjs"
import { useState } from "react"
import { FaPlus } from "react-icons/fa"
import { Button, PhoneInput } from "../../../shared"
import {
	isValidPhone,
	parsePhoneToE164,
} from "../../../shared/utils/phoneFormat"

export interface SignupFormData {
	name: string
	email: string
	password: string
	confirmPassword: string
	document_id: string
	phone: string
	birthdate: string
	gender: string
	address: string
	blood_type?: string
	allergies: string[]
}

interface SignupFormErrors {
	name?: string
	email?: string
	password?: string
	confirmPassword?: string
	document_id?: string
	phone?: string
	birthdate?: string
	gender?: string
	address?: string
	blood_type?: string
	allergies?: string[]
}

interface SignupFormProps {
	onSignUp: (data: Omit<SignupFormData, "confirmPassword">) => void
}

const SignupForm = ({ onSignUp }: SignupFormProps) => {
	const [formData, setFormData] = useState<SignupFormData>({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
		document_id: "",
		phone: "",
		birthdate: "",
		gender: "",
		address: "",
		blood_type: "",
		allergies: [],
	})

	const [errors, setErrors] = useState<SignupFormErrors>({})
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [allergyInput, setAllergyInput] = useState("")

	const validateEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		return emailRegex.test(email)
	}

	const validateDocumentId = (docId: string): boolean => {
		// Acepta V-, J- o E- seguido de 4 a 8 números
		return /^[VJE]-[0-9]{4,8}$/.test(docId)
	}

	const addAllergy = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && allergyInput.trim() !== "") {
			e.preventDefault()
			const newAllergy = allergyInput.trim()
			if (!formData.allergies.includes(newAllergy)) {
				setFormData((prev) => ({
					...prev,
					allergies: [...prev.allergies, newAllergy],
				}))
			}
			setAllergyInput("")
		}
	}

	const removeAllergy = (indexToRemove: number) => {
		setFormData((prev) => ({
			...prev,
			allergies: prev.allergies.filter((_, index) => index !== indexToRemove),
		}))
	}

	const validateForm = (): boolean => {
		const newErrors: SignupFormErrors = {}

		if (!formData.name.trim()) {
			newErrors.name = "El nombre es requerido"
		} else if (formData.name.trim().length < 2) {
			newErrors.name = "El nombre debe tener al menos 2 caracteres"
		}

		if (!formData.email.trim()) {
			newErrors.email = "El correo electrónico es requerido"
		} else if (!validateEmail(formData.email)) {
			newErrors.email = "Ingresa un correo electrónico válido"
		}

		if (!formData.password) {
			newErrors.password = "La contraseña es requerida"
		} else if (formData.password.length < 8) {
			newErrors.password = "La contraseña debe tener al menos 8 caracteres"
		}

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = "Confirma tu contraseña"
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Las contraseñas no coinciden"
		}

		if (!formData.document_id.trim()) {
			newErrors.document_id = "La cédula/documento es requerido"
		} else if (!validateDocumentId(formData.document_id)) {
			newErrors.document_id =
				"La cédula debe tener entre 6 y 12 caracteres alfanuméricos"
		}

		if (!formData.phone.trim()) {
			newErrors.phone = "El teléfono es requerido"
		} else if (!isValidPhone(formData.phone)) {
			newErrors.phone = "Ingresa un número válido (+58 4XX XXX XXXX)"
		}

		if (!formData.birthdate) {
			newErrors.birthdate = "La fecha de nacimiento es requerida"
		} else {
			const birthDate = new Date(formData.birthdate)
			const today = new Date()
			const age = today.getFullYear() - birthDate.getFullYear()
			const monthDiff = today.getMonth() - birthDate.getMonth()
			const actualAge =
				monthDiff < 0 ||
				(monthDiff === 0 && today.getDate() < birthDate.getDate())
					? age - 1
					: age
			if (actualAge < 0) {
				newErrors.birthdate = "La fecha de nacimiento no puede ser futura"
			} else if (actualAge > 120) {
				newErrors.birthdate = "Por favor verifica la fecha de nacimiento"
			}
		}

		if (!formData.gender) {
			newErrors.gender = "El género es requerido"
		}

		if (!formData.address.trim()) {
			newErrors.address = "La dirección es requerida"
		} else if (formData.address.trim().length < 5) {
			newErrors.address = "La dirección debe tener al menos 5 caracteres"
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleChange =
		(field: keyof SignupFormData) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
			const value = e.target.value
			setFormData((prev) => ({ ...prev, [field]: value }))
			if (errors[field]) {
				setErrors((prev) => ({ ...prev, [field]: undefined }))
			}
			if (field === "password" && errors.confirmPassword) {
				setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
			}
			if (
				field === "confirmPassword" &&
				formData.password === value &&
				errors.confirmPassword
			) {
				setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
			}
		}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!validateForm()) return
		setIsSubmitting(true)
		try {
			const { confirmPassword: _confirmPassword, ...dataToSend } = formData
			await onSignUp({
				...dataToSend,
				phone: parsePhoneToE164(formData.phone),
			})
		} catch (error) {
			console.error("Error in signup:", error)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="py-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Name */}
				<div className="flex flex-col gap-1">
					<label
						htmlFor="name"
						className="text-sm font-semibold text-gray-700 ml-1"
					>
						Nombre Completo <span className="text-red-500">*</span>
					</label>
					<Input
						id="name"
						placeholder="Ingresa tu nombre completo"
						size="large"
						value={formData.name}
						onChange={handleChange("name")}
						status={errors.name ? "error" : ""}
						className="rounded-xl h-12"
					/>
					{errors.name && (
						<span className="text-red-500 text-xs ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
							{errors.name}
						</span>
					)}
				</div>

				{/* Document ID */}
				<div className="flex flex-col gap-1">
					<label
						htmlFor="document_id"
						className="text-sm font-semibold text-gray-700 ml-1"
					>
						Documento de Identidad <span className="text-red-500">*</span>
					</label>
					<Space.Compact>
						<Select
							// Extraemos el prefijo del estado (V, J o E). Por defecto "V"
							value={formData.document_id.split("-")[0] || "V"}
							className="w-16 h-12"
							size="large"
							onChange={(prefix) => {
								const currentNumbers = formData.document_id.split("-")[1] || ""
								handleChange("document_id")({
									target: {
										name: "document_id",
										value: `${prefix}-${currentNumbers}`,
									},
								} as React.ChangeEvent<HTMLInputElement>)
							}}
						>
							<Option value="V">V-</Option>
							<Option value="J">J-</Option>
							<Option value="E">E-</Option>
						</Select>
						<Input
							id="document_id"
							name="document_id"
							size="large"
							placeholder="12345678"
							className="rounded-xl h-12"
							status={errors.document_id ? "error" : ""}
							maxLength={8}
							// Extraemos solo los números para mostrar en el input
							value={formData.document_id.split("-")[1] || ""}
							onChange={(e) => {
								const onlyNumbers = e.target.value
									.replace(/[^\d]/g, "")
									.slice(0, 8)
								const currentPrefix = formData.document_id.split("-")[0] || "V"

								handleChange("document_id")({
									target: {
										name: "document_id",
										value: `${currentPrefix}-${onlyNumbers}`,
									},
								} as React.ChangeEvent<HTMLInputElement>)
							}}
						/>
					</Space.Compact>
					{errors.document_id && (
						<span className="text-red-500 text-xs ml-1 mt-1">
							{errors.document_id}
						</span>
					)}
				</div>
				{/* Email */}
				<div className="flex flex-col gap-1">
					<label
						htmlFor="email"
						className="text-sm font-semibold text-gray-700 ml-1"
					>
						Correo Electrónico <span className="text-red-500">*</span>
					</label>
					<Input
						id="email"
						type="email"
						placeholder="correo@ejemplo.com"
						size="large"
						value={formData.email}
						onChange={handleChange("email")}
						status={errors.email ? "error" : ""}
						className="rounded-xl h-12"
					/>
					{errors.email && (
						<span className="text-red-500 text-xs ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
							{errors.email}
						</span>
					)}
				</div>

				<div className="flex flex-col gap-1">
					<label
						htmlFor="phone"
						className="text-sm text-gray-700 ml-1 font-semibold flex justify-start"
					>
						Teléfono
						<span className="text-red-500 ml-1">*</span>
					</label>
					<PhoneInput
						value={formData.phone}
						onChange={(e164Value) =>
							setFormData((prev) => ({ ...prev, phone: e164Value }))
						}
						placeholder="4XX XXX XXXX"
						className={`w-full h-12 ${errors.phone ? "border-red-500" : ""}`}
					/>
					{errors.phone && (
						<p
							className="text-red-500 text-sm mt-1 ml-1 flex items-center gap-1"
							role="alert"
						>
							<span className="text-red-500">•</span>
							{errors.phone}
						</p>
					)}
				</div>

				{/* Birthdate */}
				<div className="flex flex-col gap-1">
					<label
						htmlFor="birthdate"
						className="text-sm font-semibold text-gray-700 ml-1"
					>
						Fecha de Nacimiento <span className="text-red-500">*</span>
					</label>
					<DatePicker
						id="birthdate"
						size="large"
						placeholder="Selecciona tu fecha"
						className="w-full rounded-xl h-12"
						status={errors.birthdate ? "error" : ""}
						// Antd usa objetos dayjs, por lo que convertimos el string del estado
						value={formData.birthdate ? dayjs(formData.birthdate) : null}
						// Al cambiar, convertimos el objeto dayjs de vuelta a string YYYY-MM-DD para tu estado
						onChange={(date) => {
							const dateString = date ? date.format("YYYY-MM-DD") : ""
							const syntheticEvent = {
								target: { value: dateString },
							} as React.ChangeEvent<HTMLInputElement>

							handleChange("birthdate")(syntheticEvent)
						}}
						// Deshabilitar fechas futuras
						disabledDate={(current) =>
							current && current > dayjs().endOf("day")
						}
						// Configuración regional y de formato
						format="DD/MM/YYYY"
					/>
					{errors.birthdate && (
						<span className="text-red-500 text-xs ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
							{errors.birthdate}
						</span>
					)}
				</div>

				{/* Gender */}
				<div className="flex flex-col gap-1">
					<label
						htmlFor="gender"
						className="text-sm font-semibold text-gray-700 ml-1"
					>
						Género <span className="text-red-500">*</span>
					</label>
					<Select
						id="gender"
						size="large"
						placeholder="Selecciona un género"
						className="w-full h-12 rounded-xl"
						status={errors.gender ? "error" : ""}
						value={formData.gender || undefined} // 'undefined' muestra el placeholder
						onChange={(value) => {
							const syntheticEvent = {
								target: { value },
							} as React.ChangeEvent<HTMLSelectElement>

							handleChange("gender")(syntheticEvent)
						}}
						options={[
							{ value: "M", label: "Masculino" },
							{ value: "F", label: "Femenino" },
							{ value: "O", label: "Otro" },
						]}
					/>
					{errors.gender && (
						<span className="text-red-500 text-xs ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
							{errors.gender}
						</span>
					)}
				</div>

				{/* Blood Type */}
				<div className="md:col-span-2 flex flex-col gap-1">
					<label
						htmlFor="blood_type"
						className="text-sm font-semibold text-gray-700 ml-1"
					>
						Tipo de Sangre
					</label>
					<Select
						id="blood_type"
						size="large"
						placeholder="Seleccionar tipo de sangre..."
						className="w-full h-12 rounded-xl"
						status={errors.blood_type ? "error" : ""}
						value={formData.blood_type || undefined}
						onChange={(value) => {
							const syntheticEvent = {
								target: { value },
							} as React.ChangeEvent<HTMLSelectElement>

							handleChange("blood_type")(syntheticEvent)
						}}
						allowClear // Permite deseleccionar si el usuario se equivoca
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
					/>
					{errors.blood_type && (
						<span className="text-red-500 text-xs ml-1 mt-1">
							{errors.blood_type}
						</span>
					)}
				</div>

				<div className="md:col-span-2 flex flex-col gap-2">
					<label
						htmlFor="allergies"
						className="text-sm font-semibold text-gray-700 ml-1 flex justify-start items-center gap-2"
					>
						Alergias (Presiona Enter para agregar)
					</label>

					<Input
						id="allergies"
						size="large"
						placeholder="Ej: Penicilina, Maní..."
						value={allergyInput}
						onChange={(e) => setAllergyInput(e.target.value)}
						onKeyDown={addAllergy}
						className="rounded-xl h-12"
						// Añadimos un botón al final del input para que sea más intuitivo
						suffix={
							<Button
								type="button"
								variant="text"
								size="small"
								onClick={() =>
									addAllergy({
										key: "Enter",
										preventDefault: () => {},
									} as React.KeyboardEvent<HTMLInputElement>)
								}
								icon={<FaPlus />}
								className="text-primary! hover:scale-110! transition-transform p-0! min-w-0! h-auto!"
							/>
						}
					/>

					{/* Contenedor de Tags de Ant Design */}
					<div className="flex flex-wrap gap-2 mt-1 min-h-8">
						{formData.allergies.length === 0 ? (
							<span className="text-xs text-gray-400 italic ml-1">
								No se han agregado alergias.
							</span>
						) : (
							<Space size={[0, 8]} wrap>
								{formData.allergies.map((allergy, index) => (
									<Tag
										key={`${allergy}`}
										closable
										onClose={() => removeAllergy(index)}
										color="error" // Esto le da el tono rojizo que tenías
										className="px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 border-none bg-red-50 text-red-600"
										closeIcon={
											<span className="text-red-400 hover:text-red-600">✕</span>
										}
									>
										{allergy}
									</Tag>
								))}
							</Space>
						)}
					</div>
				</div>

				{/* Address */}
				<div className="md:col-span-2 flex flex-col gap-1">
					<label
						htmlFor="address"
						className="text-sm font-semibold text-gray-700 ml-1"
					>
						Dirección <span className="text-red-500">*</span>
					</label>
					<TextArea
						id="address"
						placeholder="Ingresa tu dirección completa..."
						value={formData.address}
						status={errors.address ? "error" : ""}
						className="rounded-xl p-3"
						autoSize={{ minRows: 2, maxRows: 4 }}
						onChange={(e) => {
							// En lugar de intentar castear el evento completo,
							// creamos el objeto que tu handleChange espera.
							const value = e.target.value

							// Invocamos handleChange pasando un objeto sintético compatible
							handleChange("address")({
								target: { value },
							} as React.ChangeEvent<HTMLInputElement>)
						}}
					/>
					{errors.address && (
						<span className="text-red-500 text-xs ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
							{errors.address}
						</span>
					)}
				</div>

				{/* Password */}
				<div className="flex flex-col gap-1">
					<label
						htmlFor="password"
						className="text-sm font-semibold text-gray-700 ml-1"
					>
						Contraseña <span className="text-red-500">*</span>
					</label>
					<Input.Password
						id="password"
						placeholder="Mínimo 8 caracteres"
						size="large"
						className="rounded-xl h-12"
						value={formData.password}
						status={errors.password ? "error" : ""}
						onChange={(e) => {
							const value = e.target.value
							handleChange("password")({
								target: { value },
							} as React.ChangeEvent<HTMLInputElement>)
						}}
					/>
					{errors.password && (
						<span className="text-red-500 text-xs ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
							{errors.password}
						</span>
					)}
				</div>

				{/* Confirm Password */}
				<div className="flex flex-col gap-1">
					<label
						htmlFor="confirmPassword"
						className="text-sm font-semibold text-gray-700 ml-1"
					>
						Confirmar Contraseña <span className="text-red-500">*</span>
					</label>
					<Input.Password
						id="confirmPassword"
						placeholder="Repite tu contraseña"
						size="large"
						className="rounded-xl h-12"
						value={formData.confirmPassword}
						status={errors.confirmPassword ? "error" : ""}
						onChange={(e) => {
							const value = e.target.value
							handleChange("confirmPassword")({
								target: { value },
							} as React.ChangeEvent<HTMLInputElement>)
						}}
					/>
					{errors.confirmPassword && (
						<span className="text-red-500 text-xs ml-1 mt-1 animate-in fade-in slide-in-from-top-1">
							{errors.confirmPassword}
						</span>
					)}
				</div>
			</div>

			<div className="mt-6">
				<Button
					text={isSubmitting ? "Registrando..." : "Registrarse"}
					onClick={() => {}}
					type="submit"
					disabled={isSubmitting}
				/>
			</div>
		</form>
	)
}

export default SignupForm

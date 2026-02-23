import { useState } from "react"
import { Button, InputField, PhoneInput } from "../../../shared"
import { isValidPhone, parsePhoneToE164 } from "../../../shared/utils/phoneFormat"

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
		return /^[A-Za-z0-9]{6,12}$/.test(docId)
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
				<InputField
					label="Nombre Completo"
					type="text"
					placeholder="Ingresa tu nombre completo"
					value={formData.name}
					onChange={handleChange("name")}
					error={errors.name}
					required
					showIcon={false}
					showSeparator={false}
				/>

				<InputField
					label="Cédula/Documento de Identidad"
					type="text"
					placeholder="Ej: V12345678"
					value={formData.document_id}
					onChange={handleChange("document_id")}
					error={errors.document_id}
					required
					showIcon={false}
					showSeparator={false}
				/>

				<InputField
					label="Correo Electrónico"
					type="email"
					placeholder="correo@ejemplo.com"
					value={formData.email}
					onChange={handleChange("email")}
					error={errors.email}
					required
					showIcon={false}
					showSeparator={false}
				/>

				<div>
					<label
						htmlFor="phone"
						className="text-sm text-text ml-1 mb-1 flex justify-start"
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
						className={errors.phone ? "border-red-500" : ""}
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

				<div>
					<label
						htmlFor="birthdate"
						className="text-sm text-text ml-1 mb-1 flex justify-start"
					>
						Fecha de Nacimiento
						<span className="text-red-500 ml-1">*</span>
					</label>
					<input
						id="birthdate"
						type="date"
						value={formData.birthdate}
						onChange={handleChange("birthdate")}
						className={`w-full pl-4 pr-4 py-4 border-2 rounded-2xl bg-white text-text ${
							errors.birthdate
								? "border-red-500 focus:border-red-500"
								: "border-muted hover:border-primary focus:border-primary"
						} focus:outline-none transition-colors`}
						max={new Date().toISOString().split("T")[0]}
					/>
					{errors.birthdate && (
						<p
							className="text-red-500 text-sm mt-1 ml-1 flex items-center gap-1"
							role="alert"
						>
							<span className="text-red-500">•</span>
							{errors.birthdate}
						</p>
					)}
				</div>

				<div>
					<label
						htmlFor="gender"
						className="text-sm text-text ml-1 mb-1 flex justify-start"
					>
						Género
						<span className="text-red-500 ml-1">*</span>
					</label>
					<select
						id="gender"
						value={formData.gender}
						onChange={handleChange("gender")}
						className={`w-full pl-4 pr-4 py-4 border-2 rounded-2xl bg-white text-text ${
							errors.gender
								? "border-red-500 focus:border-red-500"
								: "border-muted hover:border-primary focus:border-primary"
						} focus:outline-none transition-colors`}
					>
						<option value="">Selecciona un género</option>
						<option value="M">Masculino</option>
						<option value="F">Femenino</option>
						<option value="O">Otro</option>
					</select>
					{errors.gender && (
						<p
							className="text-red-500 text-sm mt-1 ml-1 flex items-center gap-1"
							role="alert"
						>
							<span className="text-red-500">•</span>
							{errors.gender}
						</p>
					)}
				</div>

				<div className="md:col-span-2">
					<label
						htmlFor="blood_type"
						className="text-sm text-text ml-1 mb-1 flex justify-start"
					>
						Tipo de Sangre
					</label>
					<select
						id="blood_type"
						value={formData.blood_type || ""}
						onChange={handleChange("blood_type")}
						className="w-full pl-4 pr-4 py-4 border-2 rounded-2xl bg-white text-text border-muted hover:border-primary focus:border-primary focus:outline-none transition-colors"
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

				<div className="md:col-span-2 flex flex-col gap-2">
					<label
						htmlFor="allergies"
						className="text-sm text-text ml-1 flex justify-start items-center gap-2"
					>
						Alergias (Presiona Enter para agregar)
					</label>
					<input
						id="allergies"
						type="text"
						placeholder="Ej: Penicilina, Maní..."
						value={allergyInput}
						onChange={(e) => setAllergyInput(e.target.value)}
						onKeyDown={addAllergy}
						className="w-full pl-4 pr-4 py-4 border-2 rounded-2xl bg-white text-text border-muted hover:border-primary focus:border-primary focus:outline-none transition-colors"
					/>
					<div className="flex flex-wrap gap-2 mt-2">
						{formData.allergies.length === 0 ? (
							<span className="text-xs text-gray-400 italic ml-1">
								No se han agregado alergias.
							</span>
						) : (
							formData.allergies.map((allergy, index) => (
								<div
									key={`${allergy}`}
									className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-xl border border-red-100 text-sm font-medium animate-in fade-in zoom-in duration-200"
								>
									{allergy}
									<button
										type="button"
										onClick={() => removeAllergy(index)}
										className="hover:text-red-900 transition-colors p-0.5"
									>
										✕
									</button>
								</div>
							))
						)}
					</div>
				</div>

				<div className="md:col-span-2">
					<InputField
						label="Dirección"
						type="text"
						placeholder="Ingresa tu dirección completa"
						value={formData.address}
						onChange={handleChange("address")}
						error={errors.address}
						required
						showIcon={false}
						showSeparator={false}
					/>
				</div>

				<InputField
					label="Contraseña"
					type="password"
					placeholder="Crea una contraseña segura (mín. 8 caracteres)"
					value={formData.password}
					onChange={handleChange("password")}
					error={errors.password}
					required
					showIcon={false}
					showSeparator={false}
				/>

				<InputField
					label="Confirmar Contraseña"
					type="password"
					placeholder="Confirma tu contraseña"
					value={formData.confirmPassword}
					onChange={handleChange("confirmPassword")}
					error={errors.confirmPassword}
					required
					showIcon={false}
					showSeparator={false}
				/>
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

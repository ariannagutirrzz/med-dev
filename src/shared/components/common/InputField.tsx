import { useState } from "react"
import { FaEye, FaEyeSlash } from "react-icons/fa"

interface InputFieldProps {
	type: string
	placeholder?: string
	value: string
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	className?: string
	icon?: React.ReactNode
	label?: string
	showIcon?: boolean
	showSeparator?: boolean
	error?: string
	required?: boolean
}

const InputField = ({
	type,
	placeholder,
	value,
	onChange,
	className = "",
	icon,
	label,
	showIcon = true,
	showSeparator = true,
	error,
	required = false,
}: InputFieldProps) => {
	const [isPasswordVisible, setIsPasswordVisible] = useState(false)

	const toggleVisibility = () => {
		setIsPasswordVisible(!isPasswordVisible)
	}

	const inputType =
		type === "password" && !isPasswordVisible ? "password" : "text"

	const hasError = !!error
	const borderColor = hasError
		? "border-red-500 focus:border-red-500"
		: "border-muted hover:border-primary focus:border-primary"

	// Generate a unique ID for the input based on label or placeholder
	const inputId = label 
		? `input-${label.toLowerCase().replace(/\s+/g, '-')}`
		: `input-${placeholder?.toLowerCase().replace(/\s+/g, '-') || 'field'}`

	return (
		<div>
			{label && (
				<label htmlFor={inputId} className="text-sm text-text ml-1 mb-1 flex justify-start">
					{label}
					{required && <span className="text-red-500 ml-1">*</span>}
				</label>
			)}
			<div className="relative flex items-center">
				{/* Icon (Optional) */}
				{showIcon && icon && (
					<div className="absolute left-6 top-5 text-text z-10">{icon}</div>
				)}

				{/* Separator Line (Optional) */}
				{showSeparator && showIcon && (
					<div className="absolute left-16 top-4 h-8 w-0.5 bg-muted"></div>
				)}

				{/* Input Field */}
				<input
					id={inputId}
					type={inputType}
					className={`w-full ${
						showIcon ? "pl-20" : "pl-4"
					} pr-12 py-4 border-2 rounded-2xl bg-white text-text ${borderColor} focus:outline-none transition-colors ${className}`}
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					aria-invalid={hasError}
					aria-describedby={hasError ? `${inputId}-error` : undefined}
				/>

				{/* Toggle Password Visibility Icon (Only for Password Fields) */}
				{type === "password" && (
					<button
						type="button"
						className="absolute right-4 top-5 text-text hover:text-primary transition-colors cursor-pointer"
						onClick={toggleVisibility}
						aria-label={
							isPasswordVisible ? "Ocultar contraseña" : "Mostrar contraseña"
						}
					>
						{isPasswordVisible ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
					</button>
				)}
			</div>
			{/* Error Message */}
			{error && (
				<p
					id={`${inputId}-error`}
					className="text-red-500 text-sm mt-1 ml-1 flex items-center gap-1"
					role="alert"
				>
					<span className="text-red-500">•</span>
					{error}
				</p>
			)}
		</div>
	)
}

export default InputField

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
}: InputFieldProps) => {
	const [isPasswordVisible, setIsPasswordVisible] = useState(false)

	const toggleVisibility = () => {
		setIsPasswordVisible(!isPasswordVisible)
	}

	const inputType =
		type === "password" && !isPasswordVisible ? "password" : "text"

	return (
		<div>
			{label && (
				<label className="text-sm text-text ml-1 mb-1 flex justify-start">
					{label}
				</label>
			)}
			<div className="relative flex items-center">
				{/* Icon (Optional) */}
				{showIcon && icon && (
					<div className="absolute left-6 top-5 text-text z-10">
						{icon}
					</div>
				)}

				{/* Separator Line (Optional) */}
				{showSeparator && showIcon && (
					<div className="absolute left-16 top-4 h-8 w-0.5 bg-muted"></div>
				)}

				{/* Input Field */}
				<input
					type={inputType}
					className={`w-full ${
						showIcon ? "pl-20" : "pl-4"
					} pr-12 py-4 border-2 rounded-2xl bg-white text-text border-muted hover:border-primary focus:border-primary focus:outline-none transition-colors ${className}`}
					placeholder={placeholder}
					value={value}
					onChange={onChange}
				/>

				{/* Toggle Password Visibility Icon (Only for Password Fields) */}
				{type === "password" && (
					<button
						type="button"
						className="absolute right-4 top-5 text-text hover:text-primary transition-colors"
						onClick={toggleVisibility}
						aria-label={isPasswordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
					>
						{isPasswordVisible ? (
							<FaEyeSlash size={20} />
						) : (
							<FaEye size={20} />
						)}
					</button>
				)}
			</div>
		</div>
	)
}

export default InputField


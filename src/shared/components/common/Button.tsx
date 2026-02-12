interface ButtonProps {
	text: string
	onClick: () => void
	className?: string
	type?: "button" | "submit" | "reset"
	disabled?: boolean
}

const Button = ({
	text,
	onClick,
	className = "",
	type = "button",
	disabled = false,
}: ButtonProps) => {
	return (
		<button
			type={type}
			className={`w-full font-semibold py-4 mt-4 rounded-2xl transition-all duration-300 bg-primary text-white hover:bg-primary-dark hover:shadow-[0_14px_30px_rgba(120,154,97,0.25)] shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
			onClick={onClick}
			disabled={disabled}
		>
			{text}
		</button>
	)
}

export default Button

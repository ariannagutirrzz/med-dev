interface SelectionButtonsProps {
	isLogin: boolean
	onAuthToggle: (isLoginMode: boolean) => void
}

const SelectionButtons = ({ isLogin, onAuthToggle }: SelectionButtonsProps) => {
	return (
		<div className="flex gap-2 rounded-3xl p-1.5 bg-muted/30 max-w-xl mx-auto">
			<button
				type="button"
				onClick={() => onAuthToggle(true)}
				className={`w-full font-semibold py-3.5 px-16 rounded-2xl text-base transition-all duration-300 whitespace-nowrap cursor-pointer ${
					isLogin
						? "bg-primary text-white shadow-lg"
						: "text-muted hover:text-text"
				}`}
			>
				Iniciar Sesión
			</button>
			<button
				type="button"
				onClick={() => onAuthToggle(false)}
				className={`w-full font-semibold py-3.5 px-16 rounded-2xl text-base transition-all duration-300 whitespace-nowrap cursor-pointer ${
					!isLogin
						? "bg-primary text-white shadow-lg"
						: "text-muted hover:text-text"
				}`}
			>
				Registrarse
			</button>
		</div>
	)
}

export default SelectionButtons

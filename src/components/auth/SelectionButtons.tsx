interface SelectionButtonsProps {
	isLogin: boolean
	onAuthToggle: (isLoginMode: boolean) => void
}

const SelectionButtons = ({ isLogin, onAuthToggle }: SelectionButtonsProps) => {
	return (
		<div className="flex gap-2 rounded-3xl p-2 bg-muted/30">
			<button
				type="button"
				onClick={() => onAuthToggle(true)}
				className={`w-full font-semibold py-4 rounded-2xl text-sm transition-all duration-300 ${
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
				className={`w-full font-semibold py-4 rounded-2xl text-sm transition-all duration-300 ${
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


import { Button } from "../../../shared"

interface SelectionButtonsProps {
	isLogin: boolean
	onAuthToggle: (isLoginMode: boolean) => void
}

const SelectionButtons = ({ isLogin, onAuthToggle }: SelectionButtonsProps) => {
	return (
		<div className="flex gap-3 rounded-xl p-2 bg-muted/30 w-full max-w-3xl mx-auto shadow-md border border-gray-200/80">
			<Button
				type="button"
				variant={isLogin ? "primary" : "default"}
				onClick={() => onAuthToggle(true)}
				block
				className="rounded-lg py-4 px-8 font-semibold text-base whitespace-nowrap border-0 shadow-none hover:shadow-lg min-h-12"
			>
				Iniciar Sesión
			</Button>
			<Button
				type="button"
				variant={!isLogin ? "primary" : "default"}
				onClick={() => onAuthToggle(false)}
				block
				className="rounded-lg py-4 px-8 font-semibold text-base whitespace-nowrap border-0 shadow-none hover:shadow-lg text-muted hover:text-text min-h-12"
			>
				Registrarse
			</Button>
		</div>
	)
}

export default SelectionButtons

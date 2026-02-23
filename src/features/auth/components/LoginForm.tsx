import { useState } from "react"
import { FaEnvelope, FaLock } from "react-icons/fa"
import { Button, InputField } from "../../../shared"

interface LoginFormProps {
	onLogin: (data: {
		email: string
		password: string
		rememberDevice: boolean
	}) => void
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [rememberDevice, setRememberDevice] = useState(false)

	const handleRememberDevice = () => {
		setRememberDevice(!rememberDevice)
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		onLogin({ email, password, rememberDevice })
	}

	return (
		<form onSubmit={handleSubmit} className="py-6">
			<InputField
				type="email"
				icon={<FaEnvelope size={20} />}
				placeholder="correo@ejemplo.com"
				value={email}
				label="Correo Electrónico"
				onChange={(e) => setEmail(e.target.value)}
			/>

			<div className="my-6" />

			<InputField
				label="Contraseña"
				type="password"
				placeholder="Ingresa tu contraseña"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				icon={<FaLock size={20} />}
			/>

			<div className="flex items-center justify-between mt-4">
				<div className="flex items-center">
					<input
						type="checkbox"
						id="rememberDevice"
						checked={rememberDevice}
						onChange={handleRememberDevice}
						className="mr-2 h-4 w-4 border-2 border-muted rounded checked:bg-primary checked:border-primary focus:ring-primary focus:ring-2 transition-all"
					/>
					<label
						htmlFor="rememberDevice"
						className="text-sm text-text cursor-pointer"
					>
						Recordar este dispositivo
					</label>
				</div>
				<a
					href="/"
					className="text-primary hover:text-primary-dark text-sm transition-colors"
				>
					¿Olvidaste tu contraseña?
				</a>
			</div>

			<Button text="Acceder" onClick={() => {}} type="submit" />
		</form>
	)
}

export default LoginForm

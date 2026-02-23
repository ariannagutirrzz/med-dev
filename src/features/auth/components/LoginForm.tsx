import { Button as AntButton, Checkbox, Input } from "antd"
import { useState } from "react"
import { FaEnvelope, FaLock } from "react-icons/fa"
import { Button } from "../../../shared" // Mantengo tu botón personalizado si prefieres

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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		onLogin({ email, password, rememberDevice })
	}

	return (
		<form onSubmit={handleSubmit} className="py-6 space-y-5">
			{/* Email Field */}
			<div className="flex flex-col gap-1">
				<label
					htmlFor="email"
					className="text-sm font-semibold text-gray-700 ml-1"
				>
					Correo Electrónico
				</label>
				<Input
					id="email"
					type="email"
					size="large"
					placeholder="correo@ejemplo.com"
					prefix={<FaEnvelope className="text-gray-400 mr-2" />}
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="rounded-xl h-12"
				/>
			</div>

			{/* Password Field */}
			<div className="flex flex-col gap-1">
				<label
					htmlFor="password"
					className="text-sm font-semibold text-gray-700 ml-1"
				>
					Contraseña
				</label>
				<Input.Password
					id="password"
					placeholder="Ingresa tu contraseña"
					prefix={<FaLock className="text-gray-400 mr-2" />}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="rounded-xl h-12"
				/>
			</div>

			{/* "Remember this device" & Forgot Password */}
			<div className="flex items-center justify-between mt-4">
				<Checkbox
					id="rememberDevice"
					checked={rememberDevice}
					onChange={(e) => setRememberDevice(e.target.checked)}
					className="text-sm text-gray-600"
				>
					Recordar este dispositivo
				</Checkbox>

				<a
					href="/"
					className="text-primary hover:text-primary-dark text-sm font-medium transition-colors"
				>
					¿Olvidaste tu contraseña?
				</a>
			</div>

			{/* Login Button */}
			<div className="pt-4">
				<Button text="Acceder" onClick={() => {}} type="submit" />
			</div>
		</form>
	)
}

export default LoginForm

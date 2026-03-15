import { Checkbox, Input } from "antd"
import { useState } from "react"
import { Link } from "react-router-dom"
import { FaEnvelope, FaLock } from "react-icons/fa"
import { Button } from "../../../shared"

interface LoginFormProps {
	onLogin: (data: {
		email: string
		password: string
		rememberDevice: boolean
	}) => void
	error?: string | null
	onClearError?: () => void
}

const LoginForm = ({ onLogin, error, onClearError }: LoginFormProps) => {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [rememberDevice, setRememberDevice] = useState(false)
	const hasError = Boolean(error)

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		onLogin({ email, password, rememberDevice })
	}

	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value)
		if (hasError) onClearError?.()
	}

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(e.target.value)
		if (hasError) onClearError?.()
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
					onChange={handleEmailChange}
					status={hasError ? "error" : ""}
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
					onChange={handlePasswordChange}
					status={hasError ? "error" : ""}
					className="rounded-xl h-12"
				/>
				{hasError && (
					<p
						role="alert"
						className="text-red-500 text-xs font-medium mt-1.5 ml-1 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200"
					>
						{error}
					</p>
				)}
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

				<Link
					to="/recuperar-contrasena"
					className="text-primary hover:text-primary-dark text-sm font-medium transition-colors"
				>
					¿Olvidaste tu contraseña?
				</Link>
			</div>

			{/* Login Button */}
			<div className="pt-4">
				<Button type="submit" block>
					Acceder
				</Button>
			</div>
		</form>
	)
}

export default LoginForm

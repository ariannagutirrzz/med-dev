import { Checkbox, Input } from "antd"
import { useState } from "react"
import { FaEnvelope, FaLock } from "react-icons/fa"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { Button } from "../../../shared"
import { resendVerificationEmail } from "../services/authAPI"

interface LoginFormProps {
	onLogin: (data: {
		email: string
		password: string
		rememberDevice: boolean
	}) => void
	error?: string | null
	/** Set when login returns EMAIL_NOT_VERIFIED */
	errorCode?: string | null
	pendingVerificationEmail?: string | null
	onClearError?: () => void
}

const LoginForm = ({
	onLogin,
	error,
	errorCode,
	pendingVerificationEmail,
	onClearError,
}: LoginFormProps) => {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [rememberDevice, setRememberDevice] = useState(false)
	const [resendLoading, setResendLoading] = useState(false)
	const hasError = Boolean(error)
	const showResend =
		errorCode === "EMAIL_NOT_VERIFIED" &&
		Boolean(pendingVerificationEmail?.trim())

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
					<div className="mt-1.5 ml-1 space-y-2">
						<p
							role="alert"
							className="text-red-500 text-xs font-medium flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200"
						>
							{error}
						</p>
						{showResend ? (
							<button
								type="button"
								disabled={resendLoading}
								onClick={async () => {
									const target = pendingVerificationEmail?.trim()
									if (!target) return
									setResendLoading(true)
									try {
										const data = await resendVerificationEmail(target)
										toast.success(data.message ?? "Revisa tu correo.")
										if (import.meta.env.DEV && data.verifyLink) {
											console.info("[dev] Verification link:", data.verifyLink)
										}
									} catch (e) {
										toast.error(
											e instanceof Error
												? e.message
												: "No se pudo reenviar el correo",
										)
									} finally {
										setResendLoading(false)
									}
								}}
								className="text-xs font-semibold text-primary hover:text-primary-green underline disabled:opacity-50"
							>
								{resendLoading
									? "Enviando…"
									: "Reenviar correo de verificación"}
							</button>
						) : null}
					</div>
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

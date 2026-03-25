import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import logoUnidadPleura from "../assets/logo-unidad-de-pleura.png"
import { getApiBase } from "../config/axios"
import {
	LoginForm,
	SelectionButtons,
	SignupForm,
	useAuth,
} from "../features/auth"
import type { SignupFormData } from "../features/auth/components/SignupForm"

const LoginPage = () => {
	const navigate = useNavigate()
	const { login, isAuthenticated, loading } = useAuth()
	const [isLogin, setIsLogin] = useState(true)
	const [signupError, setSignupError] = useState<string | null>(null)
	const [signupSuccess, setSignupSuccess] = useState<string | null>(null)
	const [loginError, setLoginError] = useState<string | null>(null)
	const [loginErrorCode, setLoginErrorCode] = useState<string | null>(null)
	const [pendingVerificationEmail, setPendingVerificationEmail] = useState<
		string | null
	>(null)

	// Redirect if already authenticated
	useEffect(() => {
		if (!loading && isAuthenticated) {
			navigate("/dashboard/home", { replace: true })
		}
	}, [isAuthenticated, loading, navigate])

	// Show loading or nothing while checking auth
	if (loading || isAuthenticated) {
		return null
	}

	const handleAuthToggle = (isLoginMode: boolean) => {
		setIsLogin(isLoginMode)
		// Clear errors when switching modes
		setSignupError(null)
		setSignupSuccess(null)
		setLoginError(null)
		setLoginErrorCode(null)
		setPendingVerificationEmail(null)
	}

	const handleSignUp = async (
		formData: Omit<SignupFormData, "confirmPassword">,
	) => {
		setSignupError(null)
		setSignupSuccess(null)
		try {
			const response = await fetch(`${getApiBase()}/auth/signup`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			})

<<<<<<< Updated upstream
			const payload = (await response.json().catch(() => ({}))) as {
				error?: string
				message?: string
=======
			if (!response.ok) {
<<<<<<< Updated upstream
				const error = await response.json()
				throw new Error(error.error || "Error al registrarse")
=======
				const msg =
					typeof payload.error === "string" && payload.error.trim() !== ""
						? payload.error
						: "No pudimos completar el registro. Intenta de nuevo."
				throw new Error(msg)
>>>>>>> Stashed changes
>>>>>>> Stashed changes
			}

			if (!response.ok) {
				throw new Error(
					typeof payload.error === "string"
						? payload.error
						: "Error al registrarse",
				)
			}

			setSignupSuccess(
				typeof payload.message === "string"
					? payload.message
					: "Te enviamos un correo para verificar tu cuenta. Revisa tu bandeja de entrada.",
			)
			setIsLogin(true)
			if (
				import.meta.env.DEV &&
				"verifyLink" in payload &&
				typeof (payload as { verifyLink?: string }).verifyLink === "string"
			) {
				console.info(
					"[dev] Email verification link:",
					(payload as { verifyLink: string }).verifyLink,
				)
			}
		} catch (error) {
			console.error("Error signing up", error)
			let message =
				error instanceof Error ? error.message : "Error al registrarse"
			if (
				error instanceof TypeError &&
				(message === "Failed to fetch" || message.includes("fetch"))
			) {
				message =
					"No pudimos contactar al servidor. Comprueba tu conexión o que el servicio esté disponible."
			}
			setSignupError(message)
			toast.error(message)
		}
	}

	const handleLogin = async ({
		email,
		password,
		rememberDevice,
	}: {
		email: string
		password: string
		rememberDevice: boolean
	}) => {
		setLoginError(null)
		setLoginErrorCode(null)
		setPendingVerificationEmail(null)
		try {
			await login(email, password, rememberDevice)
			navigate("/dashboard")
		} catch (error) {
			console.error("Error logging in", error)
			const err = error as Error & { code?: string }
			setLoginError(
				err instanceof Error ? err.message : "Error al iniciar sesión",
			)
			if (err.code === "EMAIL_NOT_VERIFIED") {
				setLoginErrorCode("EMAIL_NOT_VERIFIED")
				setPendingVerificationEmail(email)
			}
		}
	}

	return (
		<div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
			<div className="w-full max-w-5xl">
				<div className="text-center mb-8">
					<h1 className="text-4xl md:text-5xl font-semibold text-primary-dark mb-2">
						Elige una opción
					</h1>
					<p className="text-lg md:text-xl  text-secondary mb-6">
						
					</p>

					{/* Selection Buttons */}
					<div className="flex justify-center mb-6">
						<SelectionButtons isLogin={isLogin} onAuthToggle={handleAuthToggle} />
					</div>
				</div>

				{/* Signup error banner (login errors are shown inline in LoginForm) */}
				{signupError && (
					<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg max-w-3xl mx-auto">
						<p className="text-red-700 text-sm flex items-center gap-2">
							<span className="text-red-500 font-bold">⚠</span>
							{signupError}
						</p>
					</div>
				)}

				{signupSuccess && (
					<div className="mb-4 flex min-h-16 max-w-3xl items-center rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 mx-auto">
						<p className="text-left text-sm text-primary-green">{signupSuccess}</p>
					</div>
				)}

				{/* Form Container */}
				<div className="max-w-3xl mx-auto">
					{/* Conditional Rendering for Login or Signup Form */}
					{isLogin ? (
						<LoginForm
							onLogin={handleLogin}
							error={loginError}
							errorCode={loginErrorCode}
							pendingVerificationEmail={pendingVerificationEmail}
							onClearError={() => {
								setLoginError(null)
								setLoginErrorCode(null)
								setPendingVerificationEmail(null)
							}}
						/>
					) : (
						<SignupForm onSignUp={handleSignUp} />
					)}
				</div>

				{/* Logo Below Form - Clickable */}
				<div className="text-center mt-8">
					<Link
						to="/"
						className="inline-block hover:opacity-80 transition-opacity cursor-pointer"
					>
						<img
							src={logoUnidadPleura}
							alt="Unidad de Pleura Logo"
							className="w-32 md:w-40 h-auto mx-auto"
						/>
					</Link>
				</div>
			</div>
		</div>
	)
}

export default LoginPage

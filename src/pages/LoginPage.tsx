import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import logoUnidadPleura from "../assets/logo-unidad-de-pleura.png"
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
	const [loginError, setLoginError] = useState<string | null>(null)

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
		setLoginError(null)
	}

	const handleSignUp = async (
		formData: Omit<SignupFormData, "confirmPassword">,
	) => {
		setSignupError(null)
		try {
			const response = await fetch("http://localhost:3001/api/auth/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.error || "Error al registrarse")
			}

			// Auto-login after successful signup (with "recordar" so session persists)
			await login(formData.email, formData.password, true)
			navigate("/dashboard")
		} catch (error) {
			console.error("Error signing up", error)
			setSignupError(
				error instanceof Error ? error.message : "Error al registrarse",
			)
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
		try {
			await login(email, password, rememberDevice)
			navigate("/dashboard")
		} catch (error) {
			console.error("Error logging in", error)
			setLoginError(
				error instanceof Error ? error.message : "Error al iniciar sesión",
			)
		}
	}

	return (
		<div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
			<div className="w-full max-w-5xl">
				<div className="text-center mb-8">
					<h1 className="text-4xl md:text-5xl font-semibold text-primary-dark mb-2">
						Bienvenido
					</h1>
					<p className="text-lg md:text-xl font-semibold text-secondary mb-6">
						Elige una opción
					</p>

					{/* Selection Buttons */}
					<div className="flex justify-center mb-6">
						<SelectionButtons isLogin={isLogin} onAuthToggle={handleAuthToggle} />
					</div>
				</div>

				{/* Error Messages */}
				{signupError && (
					<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg max-w-3xl mx-auto">
						<p className="text-red-700 text-sm flex items-center gap-2">
							<span className="text-red-500 font-bold">⚠</span>
							{signupError}
						</p>
					</div>
				)}
				{loginError && (
					<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg max-w-3xl mx-auto">
						<p className="text-red-700 text-sm flex items-center gap-2">
							<span className="text-red-500 font-bold">⚠</span>
							{loginError}
						</p>
					</div>
				)}

				{/* Form Container */}
				<div className="max-w-3xl mx-auto">
					{/* Conditional Rendering for Login or Signup Form */}
					{isLogin ? (
						<LoginForm onLogin={handleLogin} />
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

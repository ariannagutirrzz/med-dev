import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import logoUnidadPleura from "../assets/logo-unidad-de-pleura.png"
import SelectionButtons from "../components/auth/SelectionButtons"
import LoginForm from "../components/auth/LoginForm"
import SignupForm from "../components/auth/SignupForm"
import { useAuth } from "../contexts/AuthContext"

const LoginPage = () => {
	const navigate = useNavigate()
	const { login, isAuthenticated, loading } = useAuth()
	const [isLogin, setIsLogin] = useState(true)

	// Redirect if already authenticated
	useEffect(() => {
		if (!loading && isAuthenticated) {
			navigate("/dashboard", { replace: true })
		}
	}, [isAuthenticated, loading, navigate])

	// Show loading or nothing while checking auth
	if (loading || isAuthenticated) {
		return null
	}

	const handleAuthToggle = (isLoginMode: boolean) => {
		setIsLogin(isLoginMode)
	}

	const handleSignUp = async ({
		name,
		email,
		password,
	}: {
		name: string
		email: string
		password: string
		username?: string
	}) => {
		try {
			const response = await fetch("http://localhost:3001/api/auth/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email, password }),
			})

			if (!response.ok) {
				const error = await response.json()
				throw new Error(error.error || "Signup failed")
			}

			// Auto-login after successful signup
			await login(email, password)
			navigate("/dashboard")
		} catch (error) {
			console.error("Error signing up", error)
			alert(error instanceof Error ? error.message : "Error al registrarse")
		}
	}

	const handleLogin = async ({
		email,
		password,
	}: {
		email: string
		password: string
	}) => {
		try {
			await login(email, password)
			navigate("/dashboard")
		} catch (error) {
			console.error("Error logging in", error)
			alert(error instanceof Error ? error.message : "Error al iniciar sesión")
		}
	}

	return (
		<div className="flex min-h-screen">
			{/* Left Side - Form Section */}
			<div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-white px-4 py-8 md:py-12">
				<div className="text-center w-full max-w-md relative">
					<h1 className="text-5xl md:text-6xl font-semibold text-primary-dark mb-2">
						Bienvenido
					</h1>
					<p className="text-xl font-semibold text-secondary mb-6">
						Elige una opción
					</p>

					{/* Selection Buttons */}
					<SelectionButtons isLogin={isLogin} onAuthToggle={handleAuthToggle} />

					{/* Conditional Rendering for Login or Signup Form */}
					{isLogin ? (
						<LoginForm onLogin={handleLogin} />
					) : (
						<SignupForm onSignUp={handleSignUp} />
					)}

					{/* Logo Below Form - Clickable */}
					<Link
						to="/"
						className="mt-8 inline-block hover:opacity-80 transition-opacity cursor-pointer"
					>
						<img
							src={logoUnidadPleura}
							alt="Unidad de Pleura Logo"
							className="w-40 h-auto mx-auto"
						/>
					</Link>
				</div>
			</div>

			{/* Right Side - Image Section (Hidden on mobile) */}
			<div className="hidden md:block w-1/2 min-h-screen sticky top-0 bg-linear-to-br from-primary/20 to-secondary/20">
				<div className="flex items-center justify-center h-full">
					<div className="text-center px-8">
						<h2 className="text-4xl font-bold text-primary-dark mb-4">
							Unidad de Pleura
						</h2>
						<p className="text-lg text-muted">
							Atención especializada en enfermedades respiratorias
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export default LoginPage


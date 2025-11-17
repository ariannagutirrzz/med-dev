import { useState } from "react"
import { useNavigate } from "react-router-dom"
import logoUnidadPleura from "../assets/logo-unidad-de-pleura.png"
import SelectionButtons from "../components/auth/SelectionButtons"
import LoginForm from "../components/auth/LoginForm"
import SignupForm from "../components/auth/SignupForm"

const LoginPage = () => {
	const navigate = useNavigate()
	const [isLogin, setIsLogin] = useState(true)

	const handleAuthToggle = (isLoginMode: boolean) => {
		setIsLogin(isLoginMode)
	}

	const handleSignUp = async ({
		name,
		email,
		password,
		username,
	}: {
		name: string
		email: string
		password: string
		username?: string
	}) => {
		try {
			// TODO: Implement signup logic
			console.log("Signing up:", { name, email, password })

			navigate("/")
		} catch (error) {
			console.error("Error signing up", error)
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
			// TODO: Implement login logic
			console.log("Logging in:", { email, password })

			navigate("/")
		} catch (error) {
			console.error("Error logging in", error)
		}
	}

	return (
		<div className="flex h-screen">
			{/* Left Side - Form Section */}
			<div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-white px-4">
				<div className="text-center w-full max-w-md">
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
				</div>

				{/* Logo Below Form */}
				<div className="mt-8">
					<img
						src={logoUnidadPleura}
						alt="Unidad de Pleura Logo"
						className="w-40 h-auto"
					/>
				</div>
			</div>

			{/* Right Side - Image Section (Hidden on mobile) */}
			<div className="hidden md:block w-1/2 h-screen relative bg-linear-to-br from-primary/20 to-secondary/20">
				<div className="absolute inset-0 flex items-center justify-center">
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


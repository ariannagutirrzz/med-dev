import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import { FaEnvelope } from "react-icons/fa"
import { Button } from "../shared"
import { requestPasswordReset } from "../features/auth/services/authAPI"

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("")
	const [loading, setLoading] = useState(false)
	const [done, setDone] = useState(false)
	const [resetLink, setResetLink] = useState<string | null>(null)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!email.trim()) {
			toast.error("Ingresa tu correo electrónico")
			return
		}
		setLoading(true)
		try {
			const result = await requestPasswordReset(email.trim())
			setDone(true)
			if (result.resetLink) setResetLink(result.resetLink)
			toast.success(result.message)
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Error al enviar la solicitud"
			toast.error(message)
		} finally {
			setLoading(false)
		}
	}

	if (done) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
				<div className="w-full max-w-md text-center">
					<div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
						<p className="text-green-800 mb-4">
							Si el correo está registrado, recibirás un enlace para restablecer
							tu contraseña. Revisa tu bandeja de entrada (y spam).
						</p>
						{resetLink && (
							<div className="mt-4 p-3 bg-white rounded-lg border border-green-200 text-left">
								<p className="text-xs font-semibold text-gray-600 mb-2">
									En desarrollo: usa este enlace para restablecer la contraseña:
								</p>
								<a
									href={resetLink}
									className="text-sm text-primary break-all hover:underline"
								>
									{resetLink}
								</a>
							</div>
						)}
					</div>
					<Link to="/login">
						<Button type="button" variant="default">
							Volver al inicio de sesión
						</Button>
					</Link>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
			<div className="w-full max-w-md">
				<h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2 text-center">
					Recuperar contraseña
				</h1>
				<p className="text-gray-600 text-center mb-6">
					Ingresa tu correo y te enviaremos un enlace para restablecer tu
					contraseña.
				</p>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-semibold text-gray-700 mb-1"
						>
							Correo electrónico
						</label>
						<div className="relative">
							<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
								<FaEnvelope />
							</span>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="correo@ejemplo.com"
								className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
								disabled={loading}
							/>
						</div>
					</div>

					<Button type="submit" block loading={loading} disabled={loading}>
						Enviar enlace
					</Button>
				</form>

				<p className="mt-6 text-center">
					<Link to="/login" className="text-primary hover:underline text-sm">
						Volver al inicio de sesión
					</Link>
				</p>
			</div>
		</div>
	)
}

export default ForgotPasswordPage

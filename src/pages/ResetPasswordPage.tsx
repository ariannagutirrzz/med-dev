import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { toast } from "react-toastify"
import { FaLock } from "react-icons/fa"
import { Button } from "../shared"
import { resetPasswordWithToken } from "../features/auth/services/authAPI"

const ResetPasswordPage = () => {
	const [searchParams] = useSearchParams()
	const token = searchParams.get("token")

	const [newPassword, setNewPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [loading, setLoading] = useState(false)
	const [success, setSuccess] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!token) {
			toast.error("Falta el enlace de restablecimiento. Solicita uno nuevo.")
			return
		}
		if (newPassword.length < 8) {
			toast.error("La contraseña debe tener al menos 8 caracteres")
			return
		}
		if (newPassword !== confirmPassword) {
			toast.error("Las contraseñas no coinciden")
			return
		}

		setLoading(true)
		try {
			await resetPasswordWithToken(token, newPassword)
			setSuccess(true)
			toast.success("Contraseña actualizada. Ya puedes iniciar sesión.")
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Error al restablecer la contraseña"
			toast.error(message)
		} finally {
			setLoading(false)
		}
	}

	if (!token) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
				<div className="w-full max-w-md text-center">
					<div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
						<p className="text-amber-800">
							Falta el enlace de restablecimiento. Solicita uno nuevo desde la
							pantalla de recuperar contraseña.
						</p>
					</div>
					<Link to="/recuperar-contrasena">
						<Button type="button">Solicitar enlace</Button>
					</Link>
					<p className="mt-4">
						<Link to="/login" className="text-primary hover:underline text-sm">
							Volver al inicio de sesión
						</Link>
					</p>
				</div>
			</div>
		)
	}

	if (success) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
				<div className="w-full max-w-md text-center">
					<div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
						<p className="text-green-800">
							Tu contraseña se actualizó correctamente. Ya puedes iniciar
							sesión con tu nueva contraseña.
						</p>
					</div>
					<Link to="/login">
						<Button type="button">Iniciar sesión</Button>
					</Link>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
			<div className="w-full max-w-md">
				<h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2 text-center">
					Nueva contraseña
				</h1>
				<p className="text-gray-600 text-center mb-6">
					Elige una contraseña nueva (mínimo 8 caracteres).
				</p>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label
							htmlFor="newPassword"
							className="block text-sm font-semibold text-gray-700 mb-1"
						>
							Nueva contraseña
						</label>
						<div className="relative">
							<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
								<FaLock />
							</span>
							<input
								id="newPassword"
								type="password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								placeholder="Mínimo 8 caracteres"
								minLength={8}
								className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
								disabled={loading}
							/>
						</div>
					</div>

					<div>
						<label
							htmlFor="confirmPassword"
							className="block text-sm font-semibold text-gray-700 mb-1"
						>
							Confirmar contraseña
						</label>
						<div className="relative">
							<span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
								<FaLock />
							</span>
							<input
								id="confirmPassword"
								type="password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder="Repite la contraseña"
								className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
								disabled={loading}
							/>
						</div>
					</div>

					<Button type="submit" block loading={loading} disabled={loading}>
						Restablecer contraseña
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

export default ResetPasswordPage

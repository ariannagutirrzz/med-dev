import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { toast } from "react-toastify"
import { Button } from "../shared"
import { verifyEmailWithToken } from "../features/auth/services/authAPI"

type Status = "idle" | "loading" | "success" | "error"

const VerifyEmailPage = () => {
	const [searchParams] = useSearchParams()
	const token = searchParams.get("token")
	const [status, setStatus] = useState<Status>("idle")

	useEffect(() => {
		if (!token) {
			setStatus("error")
			return
		}

		let cancelled = false
		setStatus("loading")
		;(async () => {
			try {
				await verifyEmailWithToken(token)
				if (!cancelled) {
					setStatus("success")
					toast.success("Correo verificado.")
				}
			} catch (e) {
				if (!cancelled) {
					setStatus("error")
					toast.error(
						e instanceof Error ? e.message : "No se pudo verificar el correo",
					)
				}
			}
		})()

		return () => {
			cancelled = true
		}
	}, [token])

	if (!token) {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
				<div className="w-full max-w-md text-center">
					<div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
						<p className="text-red-800">
							Falta el enlace de verificación. Revisa el correo que te enviamos o
							solicita uno nuevo al iniciar sesión.
						</p>
					</div>
					<Link to="/login">
						<Button type="button">Ir al inicio de sesión</Button>
					</Link>
				</div>
			</div>
		)
	}

	if (status === "loading" || status === "idle") {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
				<p className="text-gray-600">Verificando tu correo…</p>
			</div>
		)
	}

	if (status === "success") {
		return (
			<div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
				<div className="w-full max-w-md text-center">
					<div className="bg-primary/10 border border-primary/30 rounded-2xl p-6 mb-6">
						<p className="text-primary-green font-medium">
							Tu correo quedó verificado. Ya puedes iniciar sesión con tu cuenta.
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
			<div className="w-full max-w-md text-center">
				<div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
					<p className="text-red-800">
						El enlace no es válido o caducó. Puedes solicitar uno nuevo desde el
						inicio de sesión.
					</p>
				</div>
				<Link to="/login">
					<Button type="button">Volver al inicio de sesión</Button>
				</Link>
			</div>
		</div>
	)
}

export default VerifyEmailPage

import { api, getApiBase } from "../../../config/axios"

export async function verifyEmailWithToken(token: string) {
	const res = await fetch(`${getApiBase()}/auth/verify-email`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ token }),
	})
	const data = (await res.json().catch(() => ({}))) as {
		error?: string
		success?: boolean
		message?: string
	}
	if (!res.ok) {
		throw new Error(
			typeof data.error === "string" ? data.error : "No se pudo verificar el correo",
		)
	}
	return data
}

export async function resendVerificationEmail(email: string) {
	const res = await fetch(`${getApiBase()}/auth/resend-verification`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email }),
	})
	const data = (await res.json().catch(() => ({}))) as {
		error?: string
		success?: boolean
		message?: string
		verifyLink?: string
	}
	if (!res.ok) {
		throw new Error(
			typeof data.error === "string" ? data.error : "No se pudo reenviar el correo",
		)
	}
	return data
}

export async function requestPasswordReset(email: string) {
	const { data } = await api.post<{
		success: boolean
		message: string
		resetLink?: string
	}>("/auth/forgot-password", { email })
	return data
}

export async function resetPasswordWithToken(token: string, newPassword: string) {
	const { data } = await api.post<{ success: boolean; message: string }>(
		"/auth/reset-password",
		{ token, newPassword },
	)
	return data
}

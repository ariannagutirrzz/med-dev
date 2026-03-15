import { api } from "../../../config/axios"

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

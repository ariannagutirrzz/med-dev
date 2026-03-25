import { sendEmailVerificationEmail } from "./EmailService.js"
import {
	EMAIL_VERIFICATION_EXPIRY_HOURS,
	storeEmailVerificationToken,
} from "../utils/emailVerificationToken.js"

function verificationBaseUrl(): string {
	return (
		process.env.FRONTEND_URL ||
		process.env.CLIENT_URL ||
		"http://localhost:5173"
	)
}

export async function sendVerificationEmailToUser(
	userId: number,
	email: string,
	displayName: string,
): Promise<{ ok: boolean; verifyLink: string; error?: string }> {
	const token = await storeEmailVerificationToken(userId)
	const verifyLink = `${verificationBaseUrl()}/verificar-correo?token=${token}`
	const sent = await sendEmailVerificationEmail(
		email,
		displayName,
		verifyLink,
		EMAIL_VERIFICATION_EXPIRY_HOURS,
	)
	return { ok: sent.ok, verifyLink, error: sent.error }
}

import { getPublicFrontendUrl } from "../config/publicFrontendUrl.js"
import { sendEmailVerificationEmail } from "./EmailService.js"
import {
	EMAIL_VERIFICATION_EXPIRY_HOURS,
	storeEmailVerificationToken,
} from "../utils/emailVerificationToken.js"

export async function sendVerificationEmailToUser(
	userId: number,
	email: string,
	displayName: string,
	options?: { linkBase?: string },
): Promise<{ ok: boolean; verifyLink: string; error?: string }> {
	const token = await storeEmailVerificationToken(userId)
	const base = options?.linkBase ?? getPublicFrontendUrl()
	const verifyLink = `${base}/verificar-correo?token=${token}`
	const sent = await sendEmailVerificationEmail(
		email,
		displayName,
		verifyLink,
		EMAIL_VERIFICATION_EXPIRY_HOURS,
	)
	return { ok: sent.ok, verifyLink, error: sent.error }
}

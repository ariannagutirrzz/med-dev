import crypto from "node:crypto"
import { query } from "../db.js"

export const EMAIL_VERIFICATION_EXPIRY_HOURS = 48

export async function storeEmailVerificationToken(
	userId: number,
): Promise<string> {
	await query("DELETE FROM email_verification_tokens WHERE user_id = $1", [
		userId,
	])
	const token = crypto.randomBytes(32).toString("hex")
	const expiresAt = new Date()
	expiresAt.setHours(expiresAt.getHours() + EMAIL_VERIFICATION_EXPIRY_HOURS)
	await query(
		`INSERT INTO email_verification_tokens (token, user_id, expires_at)
     VALUES ($1, $2, $3)`,
		[token, userId, expiresAt.toISOString()],
	)
	return token
}

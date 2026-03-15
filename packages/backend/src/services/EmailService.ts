import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM =
	process.env.EMAIL_FROM || "Unidad de Pleura <onboarding@resend.dev>"

/**
 * Send password reset email with link. No-op if RESEND_API_KEY is not set.
 */
export async function sendPasswordResetEmail(
	to: string,
	resetLink: string,
	expiryHours: number,
): Promise<{ ok: boolean; error?: string }> {
	if (!process.env.RESEND_API_KEY) {
		console.warn("RESEND_API_KEY not set; skipping password reset email")
		return { ok: false, error: "Email not configured" }
	}

	const html = `
    <p>Recibimos una solicitud para restablecer tu contraseña.</p>
    <p><a href="${resetLink}" style="color: #16a34a; font-weight: 600;">Restablecer contraseña</a></p>
    <p>Este enlace expira en ${expiryHours} hora(s). Si no solicitaste esto, ignora este correo.</p>
    <p>— Unidad de Pleura</p>
  `.trim()

	const { error } = await resend.emails.send({
		from: FROM,
		to: [to],
		subject: "Restablecer tu contraseña",
		html,
	})

	if (error) {
		console.error("Resend error:", error)
		return { ok: false, error: error.message }
	}
	return { ok: true }
}

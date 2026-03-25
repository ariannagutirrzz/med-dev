import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

/** Trim, strip outer quotes, and fix `<email@host>` (Resend wants plain email or `Name <email>`). */
function normalizeEmailFrom(raw: string | undefined): string | undefined {
	if (!raw) return undefined
	let s = raw.trim()
	if (
		(s.startsWith('"') && s.endsWith('"')) ||
		(s.startsWith("'") && s.endsWith("'"))
	) {
		s = s.slice(1, -1).trim()
	}
	const bracketOnly = /^<([^<>@\s]+@[^<>]+)>$/
	const m = s.match(bracketOnly)
	if (m) {
		s = m[1].trim()
	}
	return s || undefined
}

const FROM =
	normalizeEmailFrom(process.env.EMAIL_FROM) ||
	"Unidad de Pleura <onboarding@resend.dev>"

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

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
}

export interface AppointmentConfirmationEmailParams {
	to: string
	patientName: string
	doctorName: string
	formattedDate: string
	formattedTime: string
	notes: string | null
	wasScheduled: boolean
}

/**
 * Notify the patient by email when an appointment is created. No-op without RESEND_API_KEY.
 */
export async function sendAppointmentConfirmationEmail(
	params: AppointmentConfirmationEmailParams,
): Promise<{ ok: boolean; error?: string }> {
	if (!process.env.RESEND_API_KEY) {
		console.warn("RESEND_API_KEY not set; skipping appointment confirmation email")
		return { ok: false, error: "Email not configured" }
	}

	const {
		to,
		patientName,
		doctorName,
		formattedDate,
		formattedTime,
		notes,
		wasScheduled,
	} = params

	const statusPhrase = wasScheduled ? "programada" : "registrada"
	const safePatient = escapeHtml(patientName)
	const safeDoctor = escapeHtml(doctorName)
	const safeDate = escapeHtml(formattedDate)
	const safeTime = escapeHtml(formattedTime)
	const notesBlock = notes
		? `<p><strong>Caso / motivo:</strong> ${escapeHtml(notes)}</p>`
		: ""

	const html = `
    <p>Hola ${safePatient},</p>
    <p>Tu cita médica ha sido <strong>${statusPhrase}</strong> correctamente.</p>
    <ul style="margin: 0; padding-left: 1.25rem;">
      <li><strong>Fecha:</strong> ${safeDate}</li>
      <li><strong>Hora:</strong> ${safeTime}</li>
      <li><strong>Médico:</strong> ${safeDoctor}</li>
    </ul>
    ${notesBlock}
    <p>Por favor llega a tiempo. Si necesitas cancelar o reprogramar, contacta al consultorio.</p>
    <p>— Unidad de Pleura</p>
  `.trim()

	const { error } = await resend.emails.send({
		from: FROM,
		to: [to],
		subject: `Tu cita ha sido ${statusPhrase}`,
		html,
	})

	if (error) {
		console.error("Resend appointment email error:", error)
		return { ok: false, error: error.message }
	}
	return { ok: true }
}

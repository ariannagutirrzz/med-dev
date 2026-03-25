import crypto from "node:crypto"
import type { Request, Response } from "express"
import { getPublicFrontendUrlForRequest } from "../config/publicFrontendUrl.js"
import { query } from "../db.js"
import { sendPasswordResetEmail } from "../services/EmailService.js"
import { sendVerificationEmailToUser } from "../services/EmailVerificationService.js"
import { comparePassword, hashPassword } from "../utils/auth.js"
import { generateJWT } from "../utils/jwt.js"

const RESET_TOKEN_EXPIRY_HOURS = 1

function isPostgresError(
	error: unknown,
): error is {
	code?: string
	constraint?: string
	detail?: string
	message?: string
} {
	return (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		typeof (error as { code?: unknown }).code === "string"
	)
}

function getSignupDuplicateMessage(detail?: string, constraint?: string): string {
	const c = (constraint ?? "").toLowerCase()
	const d = (detail ?? "").toLowerCase()
	if (c.includes("email") || d.includes("(email)")) {
		return "Ya existe una cuenta registrada con este correo electrónico."
	}
	if (c.includes("document") || d.includes("document_id")) {
		return "Ya existe una cuenta registrada con este documento de identidad."
	}
	return "Este correo o documento ya está registrado. Verifica los datos o inicia sesión."
}

export const createAccount = async (req: Request, res: Response) => {
	try {
		const {
			email,
			password,
			name,
			phone,
			birthdate,
			gender,
			address,
			document_id,
			blood_type,
			allergies,
		} = req.body

		if (
			!email ||
			!password ||
			!name ||
			!document_id ||
			!phone ||
			!birthdate ||
			!gender ||
			!address
		) {
			return res.status(400).json({
				error:
					"Completa todos los campos obligatorios: correo, contraseña, nombre, documento, teléfono, fecha de nacimiento, género y dirección.",
			})
		}

		if (password.length < 8) {
			return res.status(400).json({
				error: "La contraseña debe tener al menos 8 caracteres.",
			})
		}

		// Check if user already exists
		const existingUser = await query("SELECT id FROM users WHERE email = $1", [
			email.toLowerCase(),
		])

		if (existingUser.rows.length > 0) {
			return res.status(409).json({
				error: "Ya existe una cuenta registrada con este correo electrónico.",
			})
		}

		// Hash password
		const hashedPassword = await hashPassword(password)

		// Create user
		const result = await query(
			"INSERT INTO users (email, password, name, role, document_id, phone, birthdate, gender, address, blood_type, allergies) VALUES ($1, $2, $3, 'Paciente', $4, $5, $6, $7, $8, $9, $10) RETURNING id, email, name, role",
			[
				email.toLowerCase(),
				hashedPassword,
				name,
				document_id,
				phone,
				birthdate,
				gender,
				address,
				blood_type || null,
				allergies || [],
			],
		)

		const newUser = result.rows[0]

<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
=======
>>>>>>> Stashed changes
		let emailVerificationSent = false
		let verifyLink: string | undefined
		try {
			const out = await sendVerificationEmailToUser(
				newUser.id,
				newUser.email,
				newUser.name,
<<<<<<< Updated upstream
=======
				{ linkBase: getPublicFrontendUrlForRequest(req) },
>>>>>>> Stashed changes
			)
			emailVerificationSent = out.ok
			if (!out.ok && process.env.NODE_ENV !== "production") {
				verifyLink = out.verifyLink
			}
		} catch (err) {
			console.error("Email verification send failed (signup):", err)
		}

<<<<<<< Updated upstream
=======
>>>>>>> Stashed changes
>>>>>>> Stashed changes
		res.status(201).json({
			success: true,
			message:
				"Te enviamos un correo para verificar tu dirección. Debes verificarla antes de iniciar sesión.",
			user: {
				id: newUser.id,
				document_id: newUser.document_id,
				name: newUser.name,
				email: newUser.email,
				role: newUser.role,
			},
			emailVerificationSent,
			...(verifyLink ? { verifyLink } : {}),
		})
	} catch (error) {
		console.error("Signup error:", error)
		if (isPostgresError(error) && error.code === "23505") {
			return res.status(409).json({
				error: getSignupDuplicateMessage(error.detail, error.constraint),
			})
		}
		res.status(500).json({
			error:
				"No pudimos crear tu cuenta en este momento. Revisa los datos e intenta de nuevo en unos minutos. Si el problema continúa, contacta al consultorio.",
		})
	}
}
export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body

		if (!email || !password) {
			return res.status(400).json({ error: "Email and password are required" })
		}

		// Find user by email
		const result = await query(
			`SELECT id, email, password, name, role, document_id, image, gender,
              COALESCE(email_verified, true) AS email_verified
       FROM users WHERE email = $1`,
			[email.toLowerCase()],
		)

		if (result.rows.length === 0) {
			return res.status(401).json({ error: "Invalid credentials" })
		}

		const user = result.rows[0]

		// Verify password
		const isPasswordValid = await comparePassword(password, user.password)

		if (!isPasswordValid) {
			return res.status(401).json({ error: "Invalid credentials" })
		}

		if (user.email_verified === false) {
			return res.status(403).json({
				error:
					"Debes verificar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada (y correo no deseado).",
				code: "EMAIL_NOT_VERIFIED",
			})
		}

		const token = generateJWT({ id: user.id.toString() })

		// Return user data (without password)
		res.json({
			success: true,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role || "Médico",
				document_id: user.document_id,
				image: user.image,
				gender: user.gender,
			},
			token: token,
		})
	} catch (error) {
		console.error("Login error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

/**
<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
=======
>>>>>>> Stashed changes
 * Confirm email with token from verification link.
 * POST /api/auth/verify-email { token }
 */
export const verifyEmail = async (req: Request, res: Response) => {
	try {
		const raw = req.body?.token
		const token = typeof raw === "string" ? raw.trim() : ""
		if (!token) {
			return res.status(400).json({ error: "El enlace de verificación no es válido." })
		}

		const tokenResult = await query(
			`SELECT user_id FROM email_verification_tokens
       WHERE token = $1 AND expires_at > NOW()`,
			[token],
		)

		if (tokenResult.rows.length === 0) {
			return res.status(400).json({
				error: "El enlace no es válido o ha caducado. Solicita uno nuevo desde el inicio de sesión.",
			})
		}

		const { user_id: userId } = tokenResult.rows[0] as { user_id: number }
		await query("UPDATE users SET email_verified = true WHERE id = $1", [userId])
		await query("DELETE FROM email_verification_tokens WHERE token = $1", [token])

		res.json({
			success: true,
			message: "Correo verificado. Ya puedes iniciar sesión.",
		})
	} catch (error) {
		console.error("Verify email error:", error)
		res.status(500).json({ error: "Error al verificar el correo" })
	}
}

/**
 * Resend verification email (same response whether user exists or not).
 * POST /api/auth/resend-verification { email }
 */
export const resendEmailVerification = async (req: Request, res: Response) => {
	try {
		const { email } = req.body
		if (!email || typeof email !== "string") {
			return res.status(400).json({ error: "El correo es requerido" })
		}

		const emailLower = email.toLowerCase().trim()
		const generic = {
			success: true,
			message:
				"Si el correo está registrado y aún no está verificado, te enviamos un nuevo enlace.",
		}

		const userResult = await query(
			`SELECT id, name, email_verified FROM users WHERE email = $1`,
			[emailLower],
		)

		if (userResult.rows.length === 0) {
			return res.json(generic)
		}

		const u = userResult.rows[0] as {
			id: number
			name: string
			email_verified: boolean | null
		}

		if (u.email_verified === true) {
			return res.json(generic)
		}

		const { ok, verifyLink } = await sendVerificationEmailToUser(
			u.id,
			emailLower,
			u.name,
<<<<<<< Updated upstream
=======
			{ linkBase: getPublicFrontendUrlForRequest(req) },
>>>>>>> Stashed changes
		)

		if (!ok && process.env.NODE_ENV !== "production") {
			return res.json({ ...generic, verifyLink })
		}

		return res.json(generic)
	} catch (error) {
		console.error("Resend verification error:", error)
		res.status(500).json({ error: "Error al reenviar el correo" })
	}
}

/**
<<<<<<< Updated upstream
=======
>>>>>>> Stashed changes
>>>>>>> Stashed changes
 * Request password reset (forgot password).
 * POST /api/auth/forgot-password { email }
 */
export const forgotPassword = async (req: Request, res: Response) => {
	try {
		const { email } = req.body
		if (!email || typeof email !== "string") {
			return res.status(400).json({ error: "El correo es requerido" })
		}

		const emailLower = email.toLowerCase().trim()

		const userResult = await query(
			"SELECT id FROM users WHERE email = $1",
			[emailLower],
		)
		if (userResult.rows.length === 0) {
			// Same response as success to avoid email enumeration
			return res.json({
				success: true,
				message:
					"Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.",
			})
		}

		await query(
			"DELETE FROM password_reset_tokens WHERE email = $1",
			[emailLower],
		)

		const token = crypto.randomBytes(32).toString("hex")
		const expiresAt = new Date()
		expiresAt.setHours(expiresAt.getHours() + RESET_TOKEN_EXPIRY_HOURS)

		await query(
			`INSERT INTO password_reset_tokens (token, email, expires_at)
       VALUES ($1, $2, $3)`,
			[token, emailLower, expiresAt.toISOString()],
		)

		const resetLink = `${getPublicFrontendUrlForRequest(req)}/restablecer-contrasena?token=${token}`

		const sent = await sendPasswordResetEmail(
			emailLower,
			resetLink,
			RESET_TOKEN_EXPIRY_HOURS,
		)

		// In dev, if email is not configured, return link for testing
		if (!sent.ok && process.env.NODE_ENV !== "production") {
			return res.json({
				success: true,
				message:
					"Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.",
				resetLink,
			})
		}

		res.json({
			success: true,
			message:
				"Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.",
		})
	} catch (error) {
		console.error("Forgot password error:", error)
		res.status(500).json({ error: "Error al procesar la solicitud" })
	}
}

/**
 * Reset password with token from email link.
 * POST /api/auth/reset-password { token, newPassword }
 */
export const resetPassword = async (req: Request, res: Response) => {
	try {
		const { token, newPassword } = req.body
		if (!token || !newPassword) {
			return res.status(400).json({
				error: "El enlace de restablecimiento y la nueva contraseña son requeridos.",
			})
		}

		if (newPassword.length < 8) {
			return res.status(400).json({
				error: "La contraseña debe tener al menos 8 caracteres.",
			})
		}

		const tokenResult = await query(
			`SELECT email FROM password_reset_tokens
       WHERE token = $1 AND expires_at > NOW()`,
			[token],
		)

		if (tokenResult.rows.length === 0) {
			return res.status(400).json({
				error: "El enlace ha expirado o no es válido. Solicita uno nuevo.",
			})
		}

		const { email } = tokenResult.rows[0]
		const hashedPassword = await hashPassword(newPassword)

		await query("UPDATE users SET password = $1 WHERE email = $2", [
			hashedPassword,
			email,
		])
		await query("DELETE FROM password_reset_tokens WHERE token = $1", [token])

		res.json({
			success: true,
			message: "Contraseña actualizada. Ya puedes iniciar sesión.",
		})
	} catch (error) {
		console.error("Reset password error:", error)
		res.status(500).json({ error: "Error al restablecer la contraseña" })
	}
}

export const changePassword = async (req: Request, res: Response) => {
	try {
		const { currentPassword, newPassword } = req.body
		const userId = req.user?.id

		if (!userId) {
			return res.status(401).json({ error: "User not authenticated" })
		}

		if (!currentPassword || !newPassword) {
			return res.status(400).json({
				error: "Current password and new password are required",
			})
		}

		if (newPassword.length < 8) {
			return res
				.status(400)
				.json({ error: "New password must be at least 8 characters long" })
		}

		// Get user's current password from database
		const result = await query("SELECT id, password FROM users WHERE id = $1", [
			userId,
		])

		if (result.rows.length === 0) {
			return res.status(404).json({ error: "User not found" })
		}

		const user = result.rows[0]

		// Verify current password
		const isPasswordValid = await comparePassword(
			currentPassword,
			user.password,
		)

		if (!isPasswordValid) {
			return res.status(401).json({ error: "Current password is incorrect" })
		}

		// Hash new password
		const hashedNewPassword = await hashPassword(newPassword)

		// Update password
		await query("UPDATE users SET password = $1 WHERE id = $2", [
			hashedNewPassword,
			userId,
		])

		res.json({
			success: true,
			message: "Password updated successfully",
		})
	} catch (error) {
		console.error("Change password error:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

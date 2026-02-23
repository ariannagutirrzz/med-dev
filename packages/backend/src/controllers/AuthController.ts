import type { Request, Response } from "express"
import { query } from "../db"
import { comparePassword, hashPassword } from "../utils/auth"
import { generateJWT } from "../utils/jwt"

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
					"Email, password, name, document_id, phone, birthdate, gender and address are required",
			})
		}

		if (password.length < 8) {
			return res
				.status(400)
				.json({ error: "Password must be atleast 8 characters long." })
		}

		// Check if user already exists
		const existingUser = await query("SELECT id FROM users WHERE email = $1", [
			email.toLowerCase(),
		])

		if (existingUser.rows.length > 0) {
			return res
				.status(409)
				.json({ error: "User with this email already exists" })
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

		res.status(201).json({
			success: true,
			user: {
				id: newUser.id,
				document_id: newUser.document_id,
				name: newUser.name,
				email: newUser.email,
				role: newUser.role,
			},
		})
	} catch (error) {
		console.error("Signup error:", error)
		res.status(500).json({ error: "Internal server error" })
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
			"SELECT id, email, password, name, role, document_id, image FROM users WHERE email = $1",
			[email.toLowerCase()],
		)

		if (result.rows.length === 0) {
			return res.status(401).json({ error: "Invalid email or password" })
		}

		const user = result.rows[0]

		// Verify password
		const isPasswordValid = await comparePassword(password, user.password)

		if (!isPasswordValid) {
			return res.status(401).json({ error: "Invalid email or password" })
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
			},
			token: token,
		})
	} catch (error) {
		console.error("Login error:", error)
		res.status(500).json({ error: "Internal server error" })
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

import type { Request, Response } from "express"
import { query } from "../db"

export const getCurrentUser = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id
		if (!userId) {
			return res.status(401).json({ error: "User not authenticated" })
		}

		const result = await query(
			`SELECT id, name, email, document_id, phone, birthdate, gender, address, role, title, credentials, experience, description, image, blood_type 
             FROM users 
             WHERE id = $1`,
			[userId],
		)

		if (result.rows.length === 0) {
			return res.status(404).json({ message: "User not found" })
		}

		res.json({
			user: result.rows[0],
			message: "User fetched successfully",
		})
	} catch (error) {
		console.error("Error fetching current user:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

export const getAllUsers = async (_req: Request, res: Response) => {
	try {
		const result = await query(
			`SELECT name, email, document_id, phone, birthdate, gender, address, role, title, credentials, experience, description, image, blood_type 
                    FROM users
                    ORDER BY name`,
		)

		res.json({
			users: result.rows,
			message: "Users fetched successfully",
		})
	} catch (error) {
		console.error("Error fetching users:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

export const getUserById = async (req: Request, res: Response) => {
	// .trim() ensures no accidental leading/trailing spaces from the URL
	const id = req.params.id?.trim()

	if (!id) {
		return res.status(400).json({ error: "User ID is required" })
	}

	try {
		const result = await query(
			`SELECT id, name, email, document_id, phone, birthdate, gender, address, role, title, credentials, experience, description, image, blood_type 
             FROM users 
             WHERE id = $1`,
			[parseInt(id)], // Parse to integer for ID lookup
		)

		// Check if a user was actually found
		if (result.rows.length === 0) {
			return res.status(404).json({
				message: "User not found",
				id: id,
			})
		}

		res.json({
			// Return result.rows[0] so the frontend gets an object, not an array
			user: result.rows[0],
			message: "User fetched successfully",
			id: id,
		})
	} catch (error) {
		console.error("Error fetching user:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// Keep old function for backward compatibility, but mark as deprecated
export const getUserByDocumentId = getUserById

export const getAllDoctors = async (_req: Request, res: Response) => {
	try {
		const result = await query(
			`SELECT name, email, document_id, phone, birthdate, gender, address, role, title, credentials, experience, description, image, blood_type 
             FROM users 
             WHERE role ILIKE 'Médico'`,
		)

		// Si no hay filas, el array estará vacío
		if (result.rows.length === 0) {
			return res.status(404).json({
				message: "No se encontraron médicos registrados",
			})
		}

		// Devolvemos el array completo (rows), no solo el índice [0]
		res.json({
			doctors: result.rows,
			message: `${result.rows.length} médicos encontrados con éxito`,
		})
	} catch (error) {
		console.error("Error fetching doctors:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

export const updateUser = async (req: Request, res: Response) => {
	const { id } = req.params
	const updates = req.body // e.g., { name: "New Name", description: "New Bio" }
	// Delete role in case it's sent in the request
	delete updates.role

	const keys = Object.keys(updates)
	if (keys.length === 0) {
		return res.status(400).json({ error: "No fields provided for update" })
	}

	// Build the SET clause dynamically: "SET name=$1, description=$2"
	const setClause = keys
		.map((key, index) => `${key} = $${index + 1}`)
		.join(", ")

	const values = Object.values(updates)
	values.push(parseInt(id)) // Add ID as the last parameter, parse to integer

	try {
		const result = await query(
			`UPDATE users 
       SET ${setClause} 
       WHERE id = $${values.length} 
       RETURNING *`,
			values,
		)

		if (result.rowCount === 0) {
			return res.status(404).json({ error: "User not found" })
		}

		res.json({
			user: result.rows[0],
			message: "Profile updated successfully",
		})
	} catch (error) {
		console.error("Error updating user:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

export const deleteUser = async (req: Request, res: Response) => {
	const { id } = req.params

	try {
		const result = await query(
			`DELETE FROM users WHERE id = $1 RETURNING name`,
			[parseInt(id)],
		)

		if (result.rowCount === 0) {
			return res.status(404).json({ error: "User not found" })
		}

		res.json({
			message: `User ${result.rows[0].name} deleted successfully`,
		})
	} catch (error) {
		console.error("Error deleting user:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

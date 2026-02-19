import type { Request, Response } from "express"
import { query } from "../db"

// 1. Create doctor unavailability period
export const createDoctorUnavailability = async (req: Request, res: Response) => {
	if (!req.user) {
		return res.status(401).json({ error: "Unauthorized: User not found" })
	}

	const { document_id: userId, role } = req.user

	if (role !== "Médico") {
		return res.status(403).json({
			error: "Only doctors can manage their unavailability",
		})
	}

	const { start_date, end_date, reason, is_active } = req.body

	if (!start_date) {
		return res.status(400).json({
			error: "start_date is required",
		})
	}

	if (end_date && end_date < start_date) {
		return res.status(400).json({
			error: "end_date must be after or equal to start_date",
		})
	}

	try {
		const result = await query(
			`INSERT INTO doctor_unavailability (doctor_id, start_date, end_date, reason, is_active) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, doctor_id,
       TO_CHAR(start_date, 'YYYY-MM-DD') as start_date,
       TO_CHAR(end_date, 'YYYY-MM-DD') as end_date,
       reason, is_active,
       TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
       TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') as updated_at`,
			[
				userId,
				start_date,
				end_date || null,
				reason || null,
				is_active !== undefined ? is_active : true,
			],
		)

		res.status(201).json({
			unavailability: result.rows[0],
			message: "Unavailability period created successfully",
		})
	} catch (error) {
		console.error("Error creating doctor unavailability:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// 2. Get all unavailability periods for a doctor
export const getDoctorUnavailability = async (req: Request, res: Response) => {
	const { doctor_id } = req.params

	if (!doctor_id) {
		return res.status(400).json({ error: "doctor_id is required" })
	}

	try {
		const result = await query(
			`SELECT id, doctor_id, 
       TO_CHAR(start_date, 'YYYY-MM-DD') as start_date,
       TO_CHAR(end_date, 'YYYY-MM-DD') as end_date,
       reason, is_active,
       TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
       TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') as updated_at
       FROM doctor_unavailability 
       WHERE doctor_id = $1 
       ORDER BY doctor_unavailability.start_date DESC`,
			[doctor_id],
		)

		res.json({
			unavailability: result.rows,
			message: "Doctor unavailability fetched successfully",
		})
	} catch (error) {
		console.error("Error fetching doctor unavailability:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// 3. Check if a specific date is unavailable
export const checkDateUnavailable = async (req: Request, res: Response) => {
	const { doctor_id } = req.params
	const { date } = req.query

	if (!doctor_id || !date) {
		return res.status(400).json({
			error: "doctor_id and date (YYYY-MM-DD) are required",
		})
	}

	try {
		const result = await query(
			`SELECT id, start_date, end_date, reason 
       FROM doctor_unavailability 
       WHERE doctor_id = $1 
       AND is_active = TRUE
       AND (
         (end_date IS NULL AND start_date = $2::date)
         OR (end_date IS NOT NULL AND $2::date BETWEEN start_date AND end_date)
       )`,
			[doctor_id, date],
		)

		res.json({
			isUnavailable: result.rows.length > 0,
			periods: result.rows,
			message: "Date availability checked successfully",
		})
	} catch (error) {
		console.error("Error checking date availability:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// 4. Update doctor unavailability period
export const updateDoctorUnavailability = async (req: Request, res: Response) => {
	if (!req.user) {
		return res.status(401).json({ error: "Unauthorized: User not found" })
	}

	const { document_id: userId, role } = req.user
	const { id } = req.params
	const updates = req.body

	if (role !== "Médico") {
		return res.status(403).json({
			error: "Only doctors can manage their unavailability",
		})
	}

	const allowedFields = ["start_date", "end_date", "reason", "is_active"]
	const keys = Object.keys(updates).filter((key) => allowedFields.includes(key))

	if (keys.length === 0) {
		return res.status(400).json({ error: "No valid fields provided" })
	}

	// Validate date range if both dates are being updated
	if (keys.includes("start_date") && keys.includes("end_date")) {
		if (updates.end_date && updates.end_date < updates.start_date) {
			return res.status(400).json({
				error: "end_date must be after or equal to start_date",
			})
		}
	}

	const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ")
	const values = keys.map((key) => updates[key])
	values.push(id, userId)

	try {
		const result = await query(
			`UPDATE doctor_unavailability 
       SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${values.length - 1} AND doctor_id = $${values.length}
       RETURNING id, doctor_id,
       TO_CHAR(start_date, 'YYYY-MM-DD') as start_date,
       TO_CHAR(end_date, 'YYYY-MM-DD') as end_date,
       reason, is_active,
       TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
       TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') as updated_at`,
			values,
		)

		if (result.rowCount === 0) {
			return res.status(404).json({
				error: "Unavailability period not found or unauthorized",
			})
		}

		res.json({
			unavailability: result.rows[0],
			message: "Doctor unavailability updated successfully",
		})
	} catch (error) {
		console.error("Error updating doctor unavailability:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// 5. Delete doctor unavailability period
export const deleteDoctorUnavailability = async (req: Request, res: Response) => {
	if (!req.user) {
		return res.status(401).json({ error: "Unauthorized: User not found" })
	}

	const { document_id: userId, role } = req.user
	const { id } = req.params

	if (role !== "Médico") {
		return res.status(403).json({
			error: "Only doctors can manage their unavailability",
		})
	}

	try {
		const result = await query(
			`DELETE FROM doctor_unavailability 
       WHERE id = $1 AND doctor_id = $2`,
			[id, userId],
		)

		if (result.rowCount === 0) {
			return res.status(404).json({
				error: "Unavailability period not found or unauthorized",
			})
		}

		res.json({ message: "Doctor unavailability deleted successfully" })
	} catch (error) {
		console.error("Error deleting doctor unavailability:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

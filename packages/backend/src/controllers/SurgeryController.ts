import type { Request, Response } from "express"
import { query } from "../db"
import {
	notifySurgeryCreated,
	notifySurgeryUpdated,
} from "../utils/notificationHelpers"

// 1. Create Surgery (Reservation)
export const createSurgery = async (req: Request, res: Response) => {
	const { patient_id, surgery_date, status, notes, surgery_type, service_id } =
		req.body

	// Logic: doctor_id is extracted from the logged-in user's data
	const doctor_id = req.user?.document_id

	if (!patient_id || !surgery_date || !doctor_id) {
		return res.status(400).json({
			error: "Patient ID, Surgery Date, and Doctor ID are required.",
		})
	}

	try {
		// If service_id is provided, fetch the price from doctor_services
		let price_usd: number | null = null
		let final_service_id: number | null = null

		if (service_id) {
			const serviceResult = await query(
				`SELECT id, price_usd FROM doctor_services 
				WHERE id = $1 AND doctor_id = $2 AND is_active = TRUE`,
				[service_id, doctor_id],
			)

			if (serviceResult.rows.length > 0) {
				final_service_id = serviceResult.rows[0].id
				price_usd = parseFloat(serviceResult.rows[0].price_usd)
			}
		}

		const result = await query(
			`INSERT INTO surgeries (patient_id, doctor_id, surgery_date, status, notes, surgery_type, service_id, price_usd)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
			[
				patient_id,
				doctor_id,
				surgery_date,
				status || "Scheduled",
				notes,
				surgery_type,
				final_service_id,
				price_usd,
			],
		)

		const surgery = result.rows[0]

		// Create notification for surgery creation
		try {
			const patientResult = await query(
				`SELECT first_name, last_name FROM patients WHERE document_id = $1`,
				[patient_id],
			)
			const patient = patientResult.rows[0]

			if (patient) {
				const patientName = `${patient.first_name} ${patient.last_name}`
				await notifySurgeryCreated(
					doctor_id,
					patientName,
					new Date(surgery_date),
					surgery_type,
					surgery.id,
				)
			}
		} catch (notifError) {
			console.error("Error creating surgery notification:", notifError)
		}

		res.status(201).json({
			message: "Surgery reservation created successfully.",
			surgery,
		})
	} catch (error) {
		console.error("Error creating surgery:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// 2. Get All Surgeries
export const getAllSurgeries = async (_req: Request, res: Response) => {
	try {
		// Joining with patients and users to show names instead of just IDs
		const result = await query(
			`SELECT s.*, 
                    p.first_name as patient_first_name, p.last_name as patient_last_name,
                    u.name as doctor_name
             FROM surgeries s
             JOIN patients p ON s.patient_id = p.document_id
             JOIN users u ON s.doctor_id = u.document_id
             ORDER BY s.surgery_date ASC`,
			[],
		)
		res.json({ surgeries: result.rows })
	} catch (error) {
		console.error("Error fetching surgeries:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// 3. Get Surgery By ID
export const getSurgeryById = async (req: Request, res: Response) => {
	const { id } = req.params
	try {
		const result = await query(`SELECT * FROM surgeries WHERE id = $1`, [id])

		if (result.rowCount === 0) {
			return res.status(404).json({ error: "Surgery record not found." })
		}

		res.json(result.rows[0])
	} catch (error) {
		console.error("Error fetching surgery:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// 4. Update Surgery (PATCH)
export const updateSurgery = async (req: Request, res: Response) => {
	const { id } = req.params
	const updates = req.body

	const allowedFields = [
		"surgery_date",
		"status",
		"notes",
		"patient_id",
		"surgery_type",
		"service_id",
	]
	const keys = Object.keys(updates).filter((key) => allowedFields.includes(key))

	if (keys.length === 0) {
		return res
			.status(400)
			.json({ error: "No valid fields provided for update." })
	}

	// If service_id is being updated, fetch the price
	let price_usd: number | null = null
	if (keys.includes("service_id")) {
		const doctor_id = req.user?.document_id
		if (doctor_id) {
			const serviceResult = await query(
				`SELECT id, price_usd FROM doctor_services 
				WHERE id = $1 AND doctor_id = $2 AND is_active = TRUE`,
				[updates.service_id, doctor_id],
			)

			if (serviceResult.rows.length > 0) {
				price_usd = parseFloat(serviceResult.rows[0].price_usd)
				// Add price_usd to the update
				if (!keys.includes("price_usd")) {
					keys.push("price_usd")
					updates.price_usd = price_usd
				}
			}
		}
	}

	const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ")
	const values = keys.map((key) => updates[key])
	values.push(id)

	try {
		const result = await query(
			`UPDATE surgeries 
             SET ${setClause}, updated_at = NOW()
             WHERE id = $${values.length}
             RETURNING *`,
			values,
		)

		if (result.rowCount === 0) {
			return res.status(404).json({ error: "Surgery record not found." })
		}

		const updatedSurgery = result.rows[0]

		// Create notification for surgery update
		try {
			const doctor_id = req.user?.document_id
			if (doctor_id) {
				const patientResult = await query(
					`SELECT first_name, last_name FROM patients WHERE document_id = $1`,
					[updatedSurgery.patient_id],
				)
				const patient = patientResult.rows[0]

				if (patient) {
					const patientName = `${patient.first_name} ${patient.last_name}`
					await notifySurgeryUpdated(
						doctor_id,
						patientName,
						new Date(updatedSurgery.surgery_date),
						updatedSurgery.surgery_type,
						updatedSurgery.id,
						updatedSurgery.status,
					)
				}
			}
		} catch (notifError) {
			console.error("Error creating surgery update notification:", notifError)
		}

		res.json({
			message: "Surgery updated successfully",
			surgery: updatedSurgery,
		})
	} catch (error) {
		console.error("Error updating surgery:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// 5. Delete Surgery
export const deleteSurgery = async (req: Request, res: Response) => {
	const { id } = req.params
	try {
		const result = await query(`DELETE FROM surgeries WHERE id = $1`, [id])

		if (result.rowCount === 0) {
			return res.status(404).json({ error: "Surgery record not found." })
		}

		res.json({ message: "Surgery reservation deleted successfully." })
	} catch (error) {
		console.error("Error deleting surgery:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

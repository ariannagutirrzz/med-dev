import type { Request, Response } from "express"
import { query } from "../db"
import { uploadToSupabase } from "../utils/uploadImage"

// 1. Create Medical Record
export const createMedicalRecord = async (req: Request, res: Response) => {
	const {
		patient_id,
		record_date,
		diagnosis,
		treatment,
		notes,
		reason,
		background,
		physical_exam,
	} = req.body

	const doctor_id = req.user?.document_id
	const files = req.files as { [fieldname: string]: Express.Multer.File[] }

	if (!patient_id || !diagnosis) {
		return res
			.status(400)
			.json({ error: "Patient ID and Diagnosis are required." })
	}

	try {
		// Subida de imágenes a Supabase
		let rx_url = null
		let tomo_url = null

		if (files?.rx_torax?.[0]) {
			rx_url = await uploadToSupabase(files.rx_torax[0], "studies")
		}
		if (files?.tomography?.[0]) {
			tomo_url = await uploadToSupabase(files.tomography[0], "studies")
		}

		const result = await query(
			`INSERT INTO medical_records 
             (patient_id, doctor_id, record_date, diagnosis, treatment, notes, reason, background, physical_exam, rx_torax, tomography)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING *`,
			[
				patient_id,
				doctor_id,
				record_date || new Date(),
				diagnosis,
				treatment,
				notes,
				reason,
				background,
				physical_exam,
				rx_url, // URL de Supabase
				tomo_url, // URL de Supabase
			],
		)

		res.status(201).json({
			message: "Medical record created successfully.",
			record: result.rows[0],
		})
	} catch (error) {
		console.error("Error creating medical record:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// 2. Get All Records for a Specific Patient
// (Usually, you want to see records filtered by patient)
export const getPatientHistory = async (req: Request, res: Response) => {
	const { patientId } = req.params
	try {
		const result = await query(
			`SELECT m.*, u.name as doctor_name
             FROM medical_records m
             JOIN users u ON m.doctor_id = u.document_id
             WHERE m.patient_id = $1
             ORDER BY m.record_date DESC`,
			[patientId],
		)
		res.json({ history: result.rows })
	} catch (error) {
		console.error("Error fetching patient history:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// 3. Get Single Record by ID
export const getRecordById = async (req: Request, res: Response) => {
	const { id } = req.params
	try {
		const result = await query(
			`SELECT m.*, p.first_name, p.last_name, u.name as doctor_name
             FROM medical_records m
             JOIN patients p ON m.patient_id = p.document_id
             JOIN users u ON m.doctor_id = u.document_id
             WHERE m.id = $1`,
			[id],
		)

		if (result.rowCount === 0)
			return res.status(404).json({ error: "Record not found." })

		res.json(result.rows[0])
	} catch (error) {
		console.error("Error fetching record:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// 4. Update Medical Record
export const updateMedicalRecord = async (req: Request, res: Response) => {
	const { id } = req.params
	const updates = { ...req.body }
	const files = req.files as { [fieldname: string]: Express.Multer.File[] }

	try {
		// Si vienen archivos nuevos, los subimos y actualizamos el objeto updates
		if (files?.rx_torax?.[0]) {
			updates.rx_torax = await uploadToSupabase(files.rx_torax[0], "studies")
		}
		if (files?.tomography?.[0]) {
			updates.tomography = await uploadToSupabase(
				files.tomography[0],
				"studies",
			)
		}

		const allowedFields = [
			"diagnosis",
			"treatment",
			"notes",
			"record_date",
			"reason",
			"background",
			"physical_exam",
			"rx_torax",
			"tomography",
		]

		const keys = Object.keys(updates).filter((key) =>
			allowedFields.includes(key),
		)
		if (keys.length === 0)
			return res.status(400).json({ error: "No valid fields provided" })

		const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ")
		const values = keys.map((key) => updates[key])
		values.push(id)

		const result = await query(
			`UPDATE medical_records 
             SET ${setClause}, updated_at = NOW()
             WHERE id = $${values.length}
             RETURNING *`,
			values,
		)

		res.json({ message: "Updated successfully", record: result.rows[0] })
	} catch (error) {
		console.error("Error updating record:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// 5. Delete Medical Record
export const deleteMedicalRecord = async (req: Request, res: Response) => {
	const { id } = req.params
	try {
		const result = await query(`DELETE FROM medical_records WHERE id = $1`, [
			id,
		])
		if (result.rowCount === 0)
			return res.status(404).json({ error: "Record not found" })
		res.json({ message: "Medical record deleted successfully." })
	} catch (error) {
		console.error("Error deleting record:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

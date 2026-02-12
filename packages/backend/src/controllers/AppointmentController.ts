import type { Request, Response } from "express"
import { query } from "../db"
import { sendWhatsApp } from "../utils/twilio"
import {
	notifyAppointmentCreated,
	notifyAppointmentUpdated,
} from "../utils/notificationHelpers"

const allowedStatuses = ["pending", "scheduled", "cancelled", "completed"]

// 1. Create a new appointment
export const createAppointment = async (req: Request, res: Response) => {
	const {
		patient_id: bodyPatientId,
		doctor_id: bodyDoctorId,
		appointment_date,
		status,
		notes,
		service_id,
	} = req.body
	if (!req.user) {
		return res.status(401).json({ error: "Unauthorized: User not found" })
	}
	const { document_id: userId, role } = req.user

	let patient_id: string
	let doctor_id: string

	// Logic to switch ID assignment based on Role
	if (role === "Médico") {
		doctor_id = userId
		patient_id = bodyPatientId // Doctor must specify which patient this is for
		if (!patient_id)
			return res
				.status(400)
				.json({ error: "patient_id is required for doctors." })
	} else {
		patient_id = userId
		doctor_id = bodyDoctorId // Patient must specify which doctor they are booking
		if (!doctor_id)
			return res
				.status(400)
				.json({ error: "doctor_id is required for patients." })
	}

	if (!appointment_date || !status || !notes) {
		return res.status(400).json({
			error:
				"Missing required fields: appointment_date, status, and notes (caso/motivo) are mandatory.",
		})
	}

	if (!allowedStatuses.includes(status.toLowerCase())) {
		return res.status(400).json({
			error: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
		})
	}

	const parsedDate = new Date(appointment_date)
	if (Number.isNaN(parsedDate.getTime())) {
		return res
			.status(400)
			.json({ error: "Invalid date-time format. Use YYYY-MM-DD HH:MM:SS" })
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
			`INSERT INTO appointments (patient_id, doctor_id, appointment_date, status, notes, service_id, price_usd) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *,
         TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at, 
         TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') as updated_at`,
			[
				patient_id,
				doctor_id,
				appointment_date,
				status.toLowerCase(),
				notes || null,
				final_service_id,
				price_usd,
			],
		)

		const appointment = result.rows[0]

		// Fetch patient and doctor information for WhatsApp notifications and in-app notifications
		let patient: { name: string; phone?: string } | null = null
		let doctor: { name: string; phone?: string } | null = null

		try {
			const [patientResult, doctorResult] = await Promise.all([
				query(
					`SELECT name, phone FROM users WHERE document_id = $1`,
					[patient_id],
				),
				query(`SELECT name, phone FROM users WHERE document_id = $1`, [
					doctor_id,
				]),
			])

			patient = patientResult.rows[0] || null
			doctor = doctorResult.rows[0] || null

			// Format appointment date for WhatsApp
			const appointmentDate = new Date(appointment_date)
			const formattedDate = appointmentDate.toLocaleDateString("es-ES", {
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric",
			})
			const formattedTime = appointmentDate.toLocaleTimeString("es-ES", {
				hour: "2-digit",
				minute: "2-digit",
			})

			// Send WhatsApp to patient
			if (patient?.phone) {
				const patientMessage = `Hola ${patient.name}, tu cita médica ha sido ${status === "scheduled" ? "programada" : "creada"} exitosamente.

📅 Fecha: ${formattedDate}
🕐 Hora: ${formattedTime}
👨‍⚕️ Médico: ${doctor ? doctor.name : "No especificado"}
${notes ? `📝 Caso/Motivo: ${notes}` : ""}

Por favor, asegúrate de llegar a tiempo. Si necesitas cancelar o reprogramar, contacta con el consultorio.`
				await sendWhatsApp({
					to: patient.phone,
					message: patientMessage,
				})
			}

			// Send WhatsApp to doctor
			if (doctor?.phone) {
				const doctorMessage = `Nueva cita ${status === "scheduled" ? "programada" : "creada"}

📅 Fecha: ${formattedDate}
🕐 Hora: ${formattedTime}
👤 Paciente: ${patient ? patient.name : "No especificado"}
${notes ? `📝 Caso/Motivo: ${notes}` : ""}

Por favor, confirma tu disponibilidad.`
				await sendWhatsApp({
					to: doctor.phone,
					message: doctorMessage,
				})
			}
		} catch (whatsappError) {
			// Log WhatsApp error but don't fail the appointment creation
			console.error("Error sending WhatsApp notifications:", whatsappError)
		}

		// Create in-app notification for doctor
		try {
			if (doctor && patient) {
				await notifyAppointmentCreated(
					doctor_id,
					patient.name,
					new Date(appointment_date),
					appointment.id,
				)
			}
		} catch (notifError) {
			// Log notification error but don't fail the appointment creation
			console.error("Error creating appointment notification:", notifError)
		}

		res.status(201).json({
			appointment: appointment,
			message: "Appointment created successfully",
		})
	} catch (error) {
		console.error("Error making appointment:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// 2. Get all appointments (Filtered by whichever role the user has)
export const getAllAppointments = async (req: Request, res: Response) => {
	if (!req.user) {
		return res.status(401).json({ error: "Unauthorized: User not found" })
	}
	const { document_id: userId, role } = req.user

	// If I'm a doctor, filter by doctor_id. If I'm a patient, filter by patient_id.
	const filterColumn = role === "Médico" ? "a.doctor_id" : "a.patient_id"
	const joinTable =
		role === "Médico" ? "u.name as patient_name" : "u.name as doctor_name"
	const joinOn =
		role === "Médico"
			? "a.patient_id = u.document_id"
			: "a.doctor_id = u.document_id"

	try {
		const result = await query(
			`SELECT a.*, ${joinTable}
         FROM appointments a
         LEFT JOIN users u ON ${joinOn}
         WHERE ${filterColumn} = $1 
         ORDER BY a.appointment_date DESC`,
			[userId],
		)

		res.json({
			appointments: result.rows,
			message: "Appointments fetched successfully",
		})
	} catch (error) {
		console.error("Error fetching appointments:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// 3. Get a specific appointment by ID (Secured for both roles)
export const getAppointmentById = async (req: Request, res: Response) => {
	const { id } = req.params
	if (!req.user) {
		return res.status(401).json({ error: "Unauthorized: User not found" })
	}
	const { document_id: userId, role } = req.user

	// Determine if we should check the ID against the doctor_id or patient_id column
	const roleConstraint = role === "Médico" ? "doctor_id" : "patient_id"

	try {
		const result = await query(
			`SELECT a.* 
       FROM appointments a
       LEFT JOIN users u ON (
         CASE 
           WHEN $2 = 'Médico' THEN a.patient_id = u.document_id 
           ELSE a.doctor_id = u.document_id 
         END
       )
       WHERE a.id = $1 AND a.${roleConstraint} = $3`,
			[id, role, userId],
		)

		if (result.rowCount === 0) {
			return res.status(404).json({
				error:
					"Appointment not found or you do not have permission to view it.",
			})
		}

		res.json(result.rows[0])
	} catch (error) {
		console.error("Error fetching appointment:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// 4. Update an appointment
export const updateAppointment = async (req: Request, res: Response) => {
	const { id } = req.params
	if (!req.user) {
		return res.status(401).json({ error: "Unauthorized: User not found" })
	}
	const { document_id: userId, role } = req.user
	const updates = req.body

	const allowedFields = ["appointment_date", "status", "notes"]
	const allowedStatuses = ["pending", "scheduled", "cancelled", "completed"]

	// 1. Identify which fields the user is trying to update
	const keys = Object.keys(updates).filter((key) => allowedFields.includes(key))

	if (keys.length === 0)
		return res.status(400).json({ error: "No valid fields provided" })

	// 2. NEW LOGIC: Field-Level Authorization
	// Check if 'status' is being updated by someone who is NOT a Médico
	if (keys.includes("status") && role !== "Médico") {
		return res.status(403).json({
			error:
				"Only doctors (Médicos) are authorized to update the appointment status.",
		})
	}

	// 3. Validation Loop
	for (const key of keys) {
		const value = updates[key]

		// Prevent empty mandatory fields
		if (key !== "notes" && (value === "" || value === null)) {
			return res.status(400).json({ error: `Field '${key}' cannot be empty.` })
		}
		// Validate timedate value
		if (key === "appointment_date") {
			if (Number.isNaN(new Date(value).getTime())) {
				return res.status(400).json({ error: "Invalid date-time format." })
			}
		}

		// Validate status values
		if (key === "status") {
			if (!allowedStatuses.includes(value.toLowerCase())) {
				return res.status(400).json({ error: "Invalid status value." })
			}
		}
	}

	// 4. Prepare SQL Query
	const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ")
	const values = keys.map((key) =>
		key === "status" ? updates[key].toLowerCase() : updates[key],
	)

	const idPos = values.length + 1
	const userIdPos = values.length + 2
	values.push(id, userId)

	// Security constraint to ensure users only edit their OWN appointments
	const roleConstraint = role === "Médico" ? "doctor_id" : "patient_id"

	try {
		const result = await query(
			`UPDATE appointments 
       SET ${setClause}
       WHERE id = $${idPos} AND ${roleConstraint} = $${userIdPos}
       RETURNING *,
       TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at, 
       TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') as updated_at`,
			values,
		)

		if (result.rowCount === 0)
			return res
				.status(404)
				.json({ error: "Appointment not found or unauthorized" })

		const updatedAppointment = result.rows[0]

		// Create notification for appointment update
		if (role === "Médico") {
			try {
				const patientResult = await query(
					`SELECT name FROM users WHERE document_id = $1`,
					[updatedAppointment.patient_id],
				)
				const patient = patientResult.rows[0]

				if (patient?.name) {
					await notifyAppointmentUpdated(
						userId,
						patient.name,
						new Date(updatedAppointment.appointment_date),
						updatedAppointment.id,
						updatedAppointment.status,
					)
				}
			} catch (notifError) {
				console.error("Error creating update notification:", notifError)
			}
		}

		res.json({
			appointment: updatedAppointment,
			message: "Appointment updated successfully",
		})
	} catch (error) {
		console.error("Error updating appointment:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// 5. Delete remains restricted to Doctors (as per your request)
export const deleteAppointment = async (req: Request, res: Response) => {
	const { id } = req.params
	if (!req.user) {
		return res.status(401).json({ error: "Unauthorized: User not found" })
	}
	const { document_id: userId, role } = req.user

	if (role !== "Médico") {
		return res
			.status(403)
			.json({ error: "Only doctors are authorized to delete appointments." })
	}

	try {
		const result = await query(
			`DELETE FROM appointments WHERE id = $1 AND doctor_id = $2`,
			[id, userId],
		)

		if (result.rowCount === 0)
			return res.status(404).json({ error: "Appointment not found" })
		res.json({ message: "Appointment deleted successfully" })
	} catch (error) {
		console.error("Error deleting appointment:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

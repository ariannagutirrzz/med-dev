import type { Request, Response } from "express"
import { Query, type QueryResult } from "pg"
import { query } from "../db"
import {
	notifyAppointmentCreated,
	notifyAppointmentUpdated,
} from "../utils/notificationHelpers"
import { sendWhatsApp } from "../utils/twilio"

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

	// Lógica de asignación basada en el Rol
	if (role === "Médico") {
		doctor_id = userId
		patient_id = bodyPatientId
		if (!patient_id) {
			return res
				.status(400)
				.json({ error: "El ID del paciente es requerido para médicos." })
		}
	} else if (role === "Admin") {
		// El administrador debe proveer ambos IDs manualmente
		doctor_id = bodyDoctorId
		patient_id = bodyPatientId

		if (!doctor_id || !patient_id) {
			return res.status(400).json({
				error:
					"Como administrador, debes especificar tanto el doctor_id como el patient_id.",
			})
		}
	} else {
		// Caso para el Rol de Paciente
		patient_id = userId
		doctor_id = bodyDoctorId
		if (!doctor_id) {
			return res
				.status(400)
				.json({ error: "El ID del doctor es requerido para pacientes." })
		}
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
		// Check if doctor is unavailable for this date (date range exceptions)
		const appointmentDate = new Date(appointment_date)
		const appointmentDateOnly = appointmentDate.toISOString().split("T")[0] // YYYY-MM-DD format

		const unavailabilityResult = await query(
			`SELECT id, start_date, end_date, reason 
			FROM doctor_unavailability 
			WHERE doctor_id = $1 
			AND is_active = TRUE
			AND (
				(end_date IS NULL AND start_date = $2::date)
				OR (end_date IS NOT NULL AND $2::date BETWEEN start_date AND end_date)
			)`,
			[doctor_id, appointmentDateOnly],
		)

		if (unavailabilityResult.rows.length > 0) {
			const period = unavailabilityResult.rows[0]
			const reason = period.reason ? ` (${period.reason})` : ""
			return res.status(400).json({
				error: `El doctor no está disponible en esta fecha${reason}. Por favor seleccione otra fecha.`,
			})
		}

		// Check if doctor has availability for this date and time
		const dayOfWeek = appointmentDate.getDay()
		const appointmentTime = appointmentDate.toTimeString().slice(0, 5) // HH:MM format

		// Get doctor's availability for this day
		const availabilityResult = await query(
			`SELECT start_time, end_time 
			FROM doctor_availability 
			WHERE doctor_id = $1 
			AND day_of_week = $2 
			AND is_active = TRUE`,
			[doctor_id, dayOfWeek],
		)

		if (availabilityResult.rows.length > 0) {
			// Check if the appointment time falls within any availability slot
			let isTimeAvailable = false
			for (const slot of availabilityResult.rows) {
				const slotStart = slot.start_time.slice(0, 5) // HH:MM format
				const slotEnd = slot.end_time.slice(0, 5) // HH:MM format

				if (appointmentTime >= slotStart && appointmentTime < slotEnd) {
					isTimeAvailable = true
					break
				}
			}

			if (!isTimeAvailable) {
				return res.status(400).json({
					error:
						"The selected time is not available. Please choose a time within the doctor's available hours.",
				})
			}
		} else {
			// If no availability slots are set, allow the appointment (backward compatibility)
			// You can change this to require availability slots if needed
			console.warn(
				`No availability slots found for doctor ${doctor_id} on day ${dayOfWeek}`,
			)
		}

		// Check if the time slot is already booked
		const existingAppointmentResult = await query(
			`SELECT id 
			FROM appointments 
			WHERE doctor_id = $1 
			AND DATE(appointment_date) = DATE($2)
			AND EXTRACT(HOUR FROM appointment_date) = EXTRACT(HOUR FROM $2::timestamp)
			AND EXTRACT(MINUTE FROM appointment_date) = EXTRACT(MINUTE FROM $2::timestamp)
			AND status NOT IN ('cancelled', 'completed')`,
			[doctor_id, appointment_date],
		)

		if (existingAppointmentResult.rows.length > 0) {
			return res.status(400).json({
				error: "This time slot is already booked. Please choose another time.",
			})
		}

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
				query(`SELECT name, phone FROM users WHERE document_id = $1`, [
					patient_id,
				]),
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

// 2. Get filtered appointments (Filtered by whichever role the user has)
export const getFilteredAppointments = async (req: Request, res: Response) => {
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

export const getAllAppointments = async (req: Request, res: Response) => {
	if (!req.user) {
		return res.status(401).json({ error: "Unauthorized: User not found" })
	}

	const { role } = req.user

	if (role !== "Admin") {
		return res.status(401).json({
			error: "Solo un usuario administrativo puede hacer esta solicitud.",
		})
	}

	try {
		// Realizamos el JOIN para traer el nombre del doctor desde la tabla users
		const result = await query(
			`SELECT 
                a.*, 
                p.first_name || ' ' || p.last_name as patient_name 
             FROM appointments a
             INNER JOIN patients p ON a.patient_id = p.document_id
             ORDER BY a.appointment_date DESC`,
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
	if (!req.user) return res.status(401).json({ error: "Unauthorized" })

	const { document_id: userId, role } = req.user

	try {
		let result: QueryResult
		if (role === "Admin") {
			// El Admin ve todo sin filtrar por userId
			result = await query(
				`SELECT a.*, u_pat.name as patient_name, u_doc.name as doctor_name
                 FROM appointments a
                 LEFT JOIN users u_pat ON a.patient_id = u_pat.document_id
                 LEFT JOIN users u_doc ON a.doctor_id = u_doc.document_id
                 WHERE a.id = $1`,
				[id],
			)
		} else {
			// Médicos y Pacientes mantienen su restricción
			const roleConstraint = role === "Médico" ? "doctor_id" : "patient_id"
			result = await query(
				`SELECT a.* FROM appointments a WHERE a.id = $1 AND a.${roleConstraint} = $2`,
				[id, userId],
			)
		}

		if (result.rowCount === 0) {
			return res
				.status(404)
				.json({ error: "Cita no encontrada o sin permisos." })
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
	if (!req.user) return res.status(401).json({ error: "Unauthorized" })

	const { document_id: userId, role } = req.user
	const updates = req.body

	const allowedFields = ["appointment_date", "status", "notes", "doctor_id"]
	const allowedStatuses = ["pending", "scheduled", "cancelled", "completed"]

	const keys = Object.keys(updates).filter((key) => allowedFields.includes(key))
	if (keys.length === 0)
		return res.status(400).json({ error: "No valid fields" })

	// Corrección de validación de status: Solo Médicos y Admins pueden cambiarlo
	if (keys.includes("status") && role !== "Médico" && role !== "Admin") {
		return res
			.status(403)
			.json({ error: "No tienes permiso para cambiar el estado." })
	}

	// Validaciones de valores
	for (const key of keys) {
		if (
			key === "status" &&
			!allowedStatuses.includes(updates[key].toLowerCase())
		) {
			return res.status(400).json({ error: "Estado inválido." })
		}
		if (
			key === "appointment_date" &&
			Number.isNaN(new Date(updates[key]).getTime())
		) {
			return res.status(400).json({ error: "Fecha inválida." })
		}
	}

	const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ")
	const values = keys.map((k) =>
		k === "status" ? updates[k].toLowerCase() : updates[k],
	)

	try {
		let queryStr = ""
		const queryParams = [...values, id]

		if (role === "Admin") {
			// Admin edita cualquier cita por ID
			queryStr = `UPDATE appointments SET ${setClause} WHERE id = $${queryParams.length} RETURNING *`
		} else {
			// Otros editan solo si les pertenece
			const roleConstraint = role === "Médico" ? "doctor_id" : "patient_id"
			queryParams.push(userId)
			queryStr = `UPDATE appointments SET ${setClause} WHERE id = $${queryParams.length - 1} AND ${roleConstraint} = $${queryParams.length} RETURNING *`
		}

		const result = await query(queryStr, queryParams)
		if (result.rowCount === 0)
			return res.status(404).json({ error: "No encontrado o no autorizado" })

		res.json({ appointment: result.rows[0], message: "Actualizado con éxito" })
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// 5. Delete remains restricted to Doctors (as per your request)
export const deleteAppointment = async (req: Request, res: Response) => {
	const { id } = req.params
	if (!req.user) return res.status(401).json({ error: "Unauthorized" })

	const { document_id: userId, role } = req.user

	// Bloquear si es Paciente
	if (role !== "Médico" && role !== "Admin") {
		return res
			.status(403)
			.json({ error: "Solo médicos o administradores pueden eliminar citas." })
	}

	try {
		let result: QueryResult
		if (role === "Admin") {
			// Borrado directo
			result = await query(`DELETE FROM appointments WHERE id = $1`, [id])
		} else {
			// Borrado restringido a sus propias citas
			result = await query(
				`DELETE FROM appointments WHERE id = $1 AND doctor_id = $2`,
				[id, userId],
			)
		}

		if (result.rowCount === 0)
			return res.status(404).json({ error: "Cita no encontrada" })

		res.json({ message: "Cita eliminada exitosamente" })
	} catch (error) {
		console.error("Error deleting appointment:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

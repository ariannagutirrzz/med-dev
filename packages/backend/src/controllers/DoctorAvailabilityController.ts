import type { Request, Response } from "express"
import { query } from "../db"

// 1. Create doctor availability slot
export const createDoctorAvailability = async (req: Request, res: Response) => {
	if (!req.user) {
		return res.status(401).json({ error: "Unauthorized: User not found" })
	}

	const { document_id: userId, role } = req.user

	if (role !== "Médico") {
		return res.status(403).json({
			error: "Only doctors can manage their availability",
		})
	}

	const { day_of_week, start_time, end_time, is_active } = req.body

	if (
		day_of_week === undefined ||
		day_of_week === null ||
		!start_time ||
		!end_time
	) {
		return res.status(400).json({
			error:
				"Missing required fields: day_of_week (0-6), start_time, and end_time are required",
		})
	}

	if (day_of_week < 0 || day_of_week > 6) {
		return res.status(400).json({
			error: "day_of_week must be between 0 (Sunday) and 6 (Saturday)",
		})
	}

	if (end_time <= start_time) {
		return res.status(400).json({
			error: "end_time must be after start_time",
		})
	}

	try {
		const result = await query(
			`INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time, is_active) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *,
       TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
       TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') as updated_at`,
			[
				userId,
				day_of_week,
				start_time,
				end_time,
				is_active !== undefined ? is_active : true,
			],
		)

		res.status(201).json({
			availability: result.rows[0],
			message: "Doctor availability created successfully",
		})
	} catch (error) {
		console.error("Error creating doctor availability:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// 2. Get all availability slots for a doctor
export const getDoctorAvailability = async (req: Request, res: Response) => {
	const { doctor_id } = req.params

	if (!doctor_id) {
		return res.status(400).json({ error: "doctor_id is required" })
	}

	try {
		const result = await query(
			`SELECT *,
       TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
       TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') as updated_at
       FROM doctor_availability 
       WHERE doctor_id = $1 
       ORDER BY day_of_week, start_time`,
			[doctor_id],
		)

		res.json({
			availability: result.rows,
			message: "Doctor availability fetched successfully",
		})
	} catch (error) {
		console.error("Error fetching doctor availability:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// 3. Get available time slots for a specific date
export const getAvailableTimeSlots = async (req: Request, res: Response) => {
	const { doctor_id } = req.params
	const { date } = req.query

	if (!doctor_id || !date) {
		return res.status(400).json({
			error: "doctor_id and date (YYYY-MM-DD) are required",
		})
	}

	const dateString = (date as string).split("T")[0]
	const [year, month, day] = dateString.split("-").map(Number)
	const safeDate = new Date(year, month - 1, day)
	const dayOfWeek = safeDate.getDay()

	if (Number.isNaN(dayOfWeek)) {
		return res.status(400).json({ error: "Invalid date format" })
	}

	const now = new Date()
	const isToday =
		now.getFullYear() === year &&
		now.getMonth() + 1 === month &&
		now.getDate() === day

	const currentTotalMinutes = now.getHours() * 60 + now.getMinutes()

	try {
		// Check if doctor is unavailable for this date
		const unavailabilityResult = await query(
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

		if (unavailabilityResult.rows.length > 0) {
			return res.json({
				availableSlots: [],
				message: "Doctor is unavailable on this date",
				isUnavailable: true,
			})
		}

		// Get day of week (0 = Sunday, 6 = Saturday)
		const targetDate = new Date(date as string)
		let dayOfWeek = targetDate.getDay()

		const [year, month, day] = (date as string).split("-").map(Number)
		const safeDate = new Date(year, month - 1, day) // Mes es 0-indexed
		dayOfWeek = safeDate.getDay()

		// Get doctor's availability for this day
		const availabilityResult = await query(
			`SELECT start_time, end_time 
       FROM doctor_availability 
       WHERE doctor_id = $1 
       AND day_of_week = $2 
       AND is_active = TRUE`,
			[doctor_id, dayOfWeek],
		)

		if (availabilityResult.rows.length === 0) {
			return res.json({
				availableSlots: [],
				message: "No availability slots found for this day",
			})
		}

		// Get existing appointments for this date
		const appointmentsResult = await query(
			`SELECT appointment_date 
       FROM appointments 
       WHERE doctor_id = $1 
       AND DATE(appointment_date) = $2 
       AND status NOT IN ('cancelled', 'completed')`,
			[doctor_id, date],
		)

		const bookedTimes = appointmentsResult.rows.map((row) => {
			const appointmentDate = new Date(row.appointment_date)
			return appointmentDate.toTimeString().slice(0, 5) // HH:MM format
		})

		// Generate available time slots (30-minute intervals)
		const availableSlots: string[] = []
		const slotDuration = 30 // minutes

		for (const availability of availabilityResult.rows) {
			const startTime = availability.start_time
			const endTime = availability.end_time

			// Parse time strings (HH:MM:SS format)
			const [startHour, startMin] = startTime.split(":").map(Number)
			const [endHour, endMin] = endTime.split(":").map(Number)

			const startMinutes = startHour * 60 + startMin
			const endMinutes = endHour * 60 + endMin

			for (
				let minutes = startMinutes;
				minutes < endMinutes;
				minutes += slotDuration
			) {
				if (isToday && minutes <= currentTotalMinutes) continue

				const hours = Math.floor(minutes / 60)
				const mins = minutes % 60
				const timeSlot = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`

				// Check if this slot is not booked
				if (!bookedTimes.includes(timeSlot)) {
					availableSlots.push(timeSlot)
				}
			}
		}

		res.json({
			availableSlots,
			message: "Available time slots fetched successfully",
		})
	} catch (error) {
		console.error("Error fetching available time slots:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// 4. Update doctor availability slot
export const updateDoctorAvailability = async (req: Request, res: Response) => {
	if (!req.user) {
		return res.status(401).json({ error: "Unauthorized: User not found" })
	}

	const { document_id: userId, role } = req.user
	const { id } = req.params
	const updates = req.body

	if (role !== "Médico") {
		return res.status(403).json({
			error: "Only doctors can manage their availability",
		})
	}

	const allowedFields = ["day_of_week", "start_time", "end_time", "is_active"]
	const keys = Object.keys(updates).filter((key) => allowedFields.includes(key))

	if (keys.length === 0) {
		return res.status(400).json({ error: "No valid fields provided" })
	}

	// Validate day_of_week if being updated
	if (keys.includes("day_of_week")) {
		if (updates.day_of_week < 0 || updates.day_of_week > 6) {
			return res.status(400).json({
				error: "day_of_week must be between 0 (Sunday) and 6 (Saturday)",
			})
		}
	}

	// Validate time range if both times are being updated
	if (keys.includes("start_time") && keys.includes("end_time")) {
		if (updates.end_time <= updates.start_time) {
			return res.status(400).json({
				error: "end_time must be after start_time",
			})
		}
	}

	const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ")
	const values = keys.map((key) => updates[key])
	values.push(id, userId)

	try {
		const result = await query(
			`UPDATE doctor_availability 
       SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${values.length - 1} AND doctor_id = $${values.length}
       RETURNING *,
       TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at,
       TO_CHAR(updated_at, 'YYYY-MM-DD HH24:MI:SS') as updated_at`,
			values,
		)

		if (result.rowCount === 0) {
			return res.status(404).json({
				error: "Availability slot not found or unauthorized",
			})
		}

		res.json({
			availability: result.rows[0],
			message: "Doctor availability updated successfully",
		})
	} catch (error) {
		console.error("Error updating doctor availability:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// 5. Delete doctor availability slot
export const deleteDoctorAvailability = async (req: Request, res: Response) => {
	if (!req.user) {
		return res.status(401).json({ error: "Unauthorized: User not found" })
	}

	const { document_id: userId, role } = req.user
	const { id } = req.params

	if (role !== "Médico") {
		return res.status(403).json({
			error: "Only doctors can manage their availability",
		})
	}

	try {
		const result = await query(
			`DELETE FROM doctor_availability 
       WHERE id = $1 AND doctor_id = $2`,
			[id, userId],
		)

		if (result.rowCount === 0) {
			return res.status(404).json({
				error: "Availability slot not found or unauthorized",
			})
		}

		res.json({ message: "Doctor availability deleted successfully" })
	} catch (error) {
		console.error("Error deleting doctor availability:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

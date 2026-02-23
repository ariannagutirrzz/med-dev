import { createNotification } from "../services/NotificationService"

/**
 * Create notification for appointment creation
 */
export async function notifyAppointmentCreated(
	user_id: string,
	responsible_name: string,
	appointment_date: Date,
	appointment_id: number,
) {
	try {
		const formattedDate = new Date(appointment_date).toLocaleDateString(
			"es-ES",
			{
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			},
		)

		await createNotification({
			user_id,
			title: "Nueva cita programada",
			message: `Se ha programado una cita con ${responsible_name} para el ${formattedDate}`,
			type: "info",
			related_type: "appointment",
			related_id: appointment_id,
		})
	} catch (error) {
		console.error("Error creating appointment notification:", error)
		// Don't throw - notification failure shouldn't break appointment creation
	}
}

/**
 * Create notification for appointment update
 */
export async function notifyAppointmentUpdated(
	user_id: string,
	responsible_name: string,
	appointment_date: Date,
	appointment_id: number,
	status: string,
) {
	try {
		const formattedDate = new Date(appointment_date).toLocaleDateString(
			"es-ES",
			{
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			},
		)

		let message = `La cita con ${responsible_name} del ${formattedDate} ha sido actualizada`
		let type: "info" | "success" | "warning" | "error" = "info"

		if (status === "cancelled") {
			message = `La cita con ${responsible_name} del ${formattedDate} ha sido cancelada`
			type = "warning"
		} else if (status === "completed") {
			message = `La cita con ${responsible_name} del ${formattedDate} ha sido completada`
			type = "success"
		}

		await createNotification({
			user_id,
			title: "Cita actualizada",
			message,
			type,
			related_type: "appointment",
			related_id: appointment_id,
		})
	} catch (error) {
		console.error("Error creating appointment update notification:", error)
	}
}

/**
 * Create notification for surgery creation
 */
export async function notifySurgeryCreated(
	user_id: string,
	patient_name: string,
	doctor_name: string,
	surgery_date: Date,
	surgery_type: string,
	surgery_id: number,
) {
	try {
		const formattedDate = new Date(surgery_date).toLocaleDateString("es-ES", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		})

		await createNotification({
			user_id,
			title: "Nueva cirugía programada",
			message: `Se ha programado una ${surgery_type} para ${patient_name} con ${doctor_name} el ${formattedDate}`,
			type: "info",
			related_type: "surgery",
			related_id: surgery_id,
		})
	} catch (error) {
		console.error("Error creating surgery notification:", error)
	}
}

/**
 * Create notification for surgery update
 */
export async function notifySurgeryUpdated(
	user_id: string,
	responsible_name: string,
	surgery_date: Date,
	surgery_type: string,
	surgery_id: number,
	status: string,
) {
	try {
		const formattedDate = new Date(surgery_date).toLocaleDateString("es-ES", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		})

		let message = `La cirugía ${surgery_type} con ${responsible_name} del ${formattedDate} ha sido actualizada`
		let type: "info" | "success" | "warning" | "error" = "info"

		if (status === "cancelled" || status === "Cancelled") {
			message = `La cirugía ${surgery_type} con ${responsible_name} del ${formattedDate} ha sido cancelada`
			type = "warning"
		} else if (status === "completed" || status === "Completed") {
			message = `La cirugía ${surgery_type} con ${responsible_name} del ${formattedDate} ha sido completada`
			type = "success"
		}

		await createNotification({
			user_id,
			title: "Cirugía actualizada",
			message,
			type,
			related_type: "surgery",
			related_id: surgery_id,
		})
	} catch (error) {
		console.error("Error creating surgery update notification:", error)
	}
}

/**
 * Create notification for upcoming appointment (24h before)
 */
export async function notifyUpcomingAppointment(
	user_id: string,
	responsible_name: string,
	appointment_date: Date,
	appointment_id: number,
) {
	try {
		const formattedDate = new Date(appointment_date).toLocaleDateString(
			"es-ES",
			{
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			},
		)

		await createNotification({
			user_id,
			title: "Recordatorio de cita",
			message: `Tienes una cita con ${responsible_name} mañana a las ${formattedDate}`,
			type: "warning",
			related_type: "appointment",
			related_id: appointment_id,
		})
	} catch (error) {
		console.error("Error creating upcoming appointment notification:", error)
	}
}

/**
 * Create notification for upcoming surgery (24h before)
 */
export async function notifyUpcomingSurgery(
	user_id: string,
	responsible_name: string,
	surgery_date: Date,
	surgery_id: number,
) {
	try {
		const formattedDate = new Date(surgery_date).toLocaleDateString("es-ES", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		})

		await createNotification({
			user_id,
			title: "Recordatorio de cirugía",
			message: `Tienes una cirugía con ${responsible_name} mañana a las ${formattedDate}`,
			type: "warning",
			related_type: "surgery",
			related_id: surgery_id,
		})
	} catch (error) {
		console.error("Error creating upcoming surgery notification:", error)
	}
}

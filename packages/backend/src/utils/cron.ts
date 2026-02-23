import cron from "node-cron"
import { query } from "../db"
import {
	notifyUpcomingAppointment,
	notifyUpcomingSurgery,
} from "./notificationHelpers"

// Se ejecuta cada hora al minuto 0
cron.schedule("0 * * * *", async () => {
	console.log("Revisando citas y cirugías próximas para notificaciones...")

	try {
		// Buscamos citas que ocurren en las próximas 24h
		// y que aún no han sido notificadas (puedes añadir una columna 'reminder_sent' bool)
		const upcomingAppointments = await query(`
            SELECT a.*, p.name as patient_name, d.name as doctor_name
            FROM appointments a
            JOIN users p ON a.patient_id = p.document_id
            JOIN users d ON a.doctor_id = d.document_id
            WHERE a.appointment_date <= (CURRENT_TIMESTAMP + INTERVAL '24 hours')
            AND a.appointment_date > CURRENT_TIMESTAMP
            AND a.status = 'scheduled'
            AND a.reminder_sent = FALSE
        `)

		for (const app of upcomingAppointments.rows) {
			// 1. Enviar notificación interna
			// Notificación del paciente
			await notifyUpcomingAppointment(
				app.patient_id,
				app.doctor_name,
				app.appointment_date,
				app.id,
			)

			// Notificación del medico
			await notifyUpcomingAppointment(
				app.doctor_id,
				app.patient_name,
				app.appointment_date,
				app.id,
			)

			// 2. Marcar como notificada para no repetir el proceso la próxima hora
			await query(
				"UPDATE appointments SET reminder_sent = TRUE WHERE id = $1",
				[app.id],
			)

			console.log(`Recordatorio enviado para la cita ${app.id}`)
		}

		// Buscamos cirugías que ocurren en las próximas 24h
		// y que aún no han sido notificadas
		const upcomingSurgeries = await query(`
            SELECT s.*, p.name as patient_name, d.name as doctor_name
            FROM surgeries s
            JOIN users p ON s.patient_id = p.document_id
            JOIN users d ON s.doctor_id = d.document_id
            WHERE s.surgery_date <= (CURRENT_TIMESTAMP + INTERVAL '24 hours')
            AND s.surgery_date > CURRENT_TIMESTAMP
            AND s.status = 'scheduled'
            AND s.reminder_sent = FALSE
        `)

		for (const surgery of upcomingSurgeries.rows) {
			// 1. Enviar notificación interna
			// Notificación del paciente
			await notifyUpcomingSurgery(
				surgery.patient_id,
				surgery.doctor_name,
				surgery.appointment_date,
				surgery.id,
			)

			// Notificación del medico
			await notifyUpcomingSurgery(
				surgery.doctor_id,
				surgery.patient_name,
				surgery.appointment_date,
				surgery.id,
			)

			// 2. Marcar como notificada para no repetir el proceso la próxima hora
			await query("UPDATE surgeries SET reminder_sent = TRUE WHERE id = $1", [
				surgery.id,
			])

			console.log(`Recordatorio enviado para la cirugía ${surgery.id}`)
		}
	} catch (error) {
		console.error("Error en el cron de recordatorios:", error)
	}
})

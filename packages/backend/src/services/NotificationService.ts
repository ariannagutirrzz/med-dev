import { query } from "../db"

export interface Notification {
	id: number
	user_id: string
	title: string
	message: string
	type: "info" | "success" | "warning" | "error"
	read: boolean
	related_type?: string | null
	related_id?: number | null
	created_at: string
	updated_at?: string | null
}

export interface CreateNotificationInput {
	user_id: string // document_id from users table
	title: string
	message: string
	type?: "info" | "success" | "warning" | "error"
	related_type?: string
	related_id?: number
}

/**
 * Get all notifications for a user
 */
export async function getNotificationsByUserId(
	user_id: string,
): Promise<Notification[]> {
	try {
		const result = await query(
			`SELECT 
				id,
				user_id,
				title,
				message,
				type,
				read,
				related_type,
				related_id,
				TO_CHAR(created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as created_at,
				TO_CHAR(updated_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as updated_at
			FROM notifications
			WHERE user_id = $1
			ORDER BY created_at DESC
			LIMIT 50`,
			[user_id],
		)

		return result.rows
	} catch (error) {
		console.error("Error fetching notifications:", error)
		throw new Error("Failed to fetch notifications")
	}
}

/**
 * Get unread notifications count for a user
 */
export async function getUnreadNotificationsCount(
	user_id: string,
): Promise<number> {
	try {
		const result = await query(
			`SELECT COUNT(*) as count
			FROM notifications
			WHERE user_id = $1 AND read = FALSE`,
			[user_id],
		)

		return parseInt(result.rows[0].count, 10)
	} catch (error) {
		console.error("Error fetching unread count:", error)
		throw new Error("Failed to fetch unread notifications count")
	}
}

/**
 * Create a new notification
 */
export async function createNotification(
	input: CreateNotificationInput,
): Promise<Notification> {
	try {
		const result = await query(
			`INSERT INTO notifications (user_id, title, message, type, related_type, related_id)
			VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING 
				id,
				user_id,
				title,
				message,
				type,
				read,
				related_type,
				related_id,
				TO_CHAR(created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as created_at,
				TO_CHAR(updated_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as updated_at`,
			[
				input.user_id,
				input.title,
				input.message,
				input.type || "info",
				input.related_type || null,
				input.related_id || null,
			],
		)

		return result.rows[0]
	} catch (error) {
		console.error("Error creating notification:", error)
		throw new Error("Failed to create notification")
	}
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
	notification_id: number,
	user_id: string,
): Promise<Notification> {
	try {
		const result = await query(
			`UPDATE notifications
			SET read = TRUE, updated_at = CURRENT_TIMESTAMP
			WHERE id = $1 AND user_id = $2
			RETURNING 
				id,
				user_id,
				title,
				message,
				type,
				read,
				related_type,
				related_id,
				TO_CHAR(created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as created_at,
				TO_CHAR(updated_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as updated_at`,
			[notification_id, user_id],
		)

		if (result.rows.length === 0) {
			throw new Error("Notification not found")
		}

		return result.rows[0]
	} catch (error) {
		console.error("Error marking notification as read:", error)
		throw new Error("Failed to mark notification as read")
	}
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(
	user_id: string,
): Promise<{ count: number }> {
	try {
		const result = await query(
			`UPDATE notifications
			SET read = TRUE, updated_at = CURRENT_TIMESTAMP
			WHERE user_id = $1 AND read = FALSE
			RETURNING id`,
			[user_id],
		)

		return { count: result.rows.length }
	} catch (error) {
		console.error("Error marking all notifications as read:", error)
		throw new Error("Failed to mark all notifications as read")
	}
}

/**
 * Delete a notification
 */
export async function deleteNotification(
	notification_id: number,
	user_id: string,
): Promise<void> {
	try {
		const result = await query(
			`DELETE FROM notifications
			WHERE id = $1 AND user_id = $2`,
			[notification_id, user_id],
		)

		if (result.rowCount === 0) {
			throw new Error("Notification not found")
		}
	} catch (error) {
		console.error("Error deleting notification:", error)
		throw new Error("Failed to delete notification")
	}
}

/** Test/utility: send appointment reminder. Used by test routes. */
export async function sendAppointmentReminder(
	_userDocumentId: string,
	userName: string,
	appointmentDate: Date,
	doctorName: string,
	opts: { email?: string; phone?: string; userDocumentId: string },
) {
	await createNotification({
		user_id: opts.userDocumentId,
		title: "Recordatorio de cita",
		message: `Hola ${userName}, tienes una cita el ${appointmentDate.toLocaleDateString("es-ES")} con ${doctorName}.`,
		type: "info",
	})
	return { email: opts.email, phone: opts.phone }
}

/** Test/utility: send inventory alert. Used by test routes. */
export async function sendInventoryAlert(
	userDocumentId: string,
	itemName: string,
	quantity: number,
	minStock: number,
	opts: { email?: string; phone?: string; userDocumentId: string },
) {
	await createNotification({
		user_id: userDocumentId,
		title: "Alerta de inventario",
		message: `El insumo "${itemName}" tiene stock bajo: ${quantity} (mínimo ${minStock}).`,
		type: "warning",
	})
	return { email: opts.email, phone: opts.phone }
}

export const notificationService = {
	sendAppointmentReminder,
	sendInventoryAlert,
}

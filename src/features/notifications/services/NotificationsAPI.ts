import { isAxiosError } from "axios"
import { api } from "../../../config/axios"

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

export interface NotificationsResponse {
	notifications: Notification[]
}

export interface UnreadCountResponse {
	count: number
}

/**
 * Get all notifications for the authenticated user
 */
export async function getNotifications(): Promise<Notification[]> {
	try {
		const { data } = await api.get<NotificationsResponse>("/notifications")
		return data.notifications
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(
				error.response.data.error || "Failed to fetch notifications",
			)
		}
		throw new Error("Failed to fetch notifications")
	}
}

/**
 * Get unread notifications count
 */
export async function getUnreadCount(): Promise<number> {
	try {
		const { data } = await api.get<UnreadCountResponse>(
			"/notifications/unread-count",
		)
		return data.count
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(
				error.response.data.error || "Failed to fetch unread count",
			)
		}
		throw new Error("Failed to fetch unread count")
	}
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: number): Promise<Notification> {
	try {
		const { data } = await api.patch<{ notification: Notification }>(
			`/notifications/${notificationId}/read`,
		)
		return data.notification
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(
				error.response.data.error || "Failed to mark notification as read",
			)
		}
		throw new Error("Failed to mark notification as read")
	}
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<{ count: number }> {
	try {
		const { data } = await api.patch<{ count: number }>(
			"/notifications/read-all",
		)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(
				error.response.data.error || "Failed to mark all as read",
			)
		}
		throw new Error("Failed to mark all as read")
	}
}

/**
 * Delete a notification
 */
export async function deleteNotification(
	notificationId: number,
): Promise<void> {
	try {
		await api.delete(`/notifications/${notificationId}`)
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(
				error.response.data.error || "Failed to delete notification",
			)
		}
		throw new Error("Failed to delete notification")
	}
}

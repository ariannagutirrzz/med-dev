import type { Request, Response } from "express"
import {
	createNotification,
	getNotificationsByUserId,
	getUnreadNotificationsCount,
	markAllNotificationsAsRead,
	markNotificationAsRead,
	deleteNotification,
} from "../services/NotificationService"

/**
 * Get all notifications for the authenticated user
 */
export const getNotifications = async (req: Request, res: Response) => {
	try {
		const user_id = req.user?.document_id

		if (!user_id) {
			return res.status(401).json({ error: "Unauthorized" })
		}

		const notifications = await getNotificationsByUserId(user_id)
		res.json({ notifications })
	} catch (error) {
		console.error("Error in getNotifications:", error)
		res.status(500).json({
			error: error instanceof Error ? error.message : "Internal server error",
		})
	}
}

/**
 * Get unread notifications count
 */
export const getUnreadCount = async (req: Request, res: Response) => {
	try {
		const user_id = req.user?.document_id

		if (!user_id) {
			return res.status(401).json({ error: "Unauthorized" })
		}

		const count = await getUnreadNotificationsCount(user_id)
		res.json({ count })
	} catch (error) {
		console.error("Error in getUnreadCount:", error)
		res.status(500).json({
			error: error instanceof Error ? error.message : "Internal server error",
		})
	}
}

/**
 * Mark a notification as read
 */
export const markAsRead = async (req: Request, res: Response) => {
	try {
		const user_id = req.user?.document_id
		const { id } = req.params

		if (!user_id) {
			return res.status(401).json({ error: "Unauthorized" })
		}

		const notification = await markNotificationAsRead(
			parseInt(id, 10),
			user_id,
		)
		res.json({ notification })
	} catch (error) {
		console.error("Error in markAsRead:", error)
		res.status(500).json({
			error: error instanceof Error ? error.message : "Internal server error",
		})
	}
}

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (req: Request, res: Response) => {
	try {
		const user_id = req.user?.document_id

		if (!user_id) {
			return res.status(401).json({ error: "Unauthorized" })
		}

		const result = await markAllNotificationsAsRead(user_id)
		res.json(result)
	} catch (error) {
		console.error("Error in markAllAsRead:", error)
		res.status(500).json({
			error: error instanceof Error ? error.message : "Internal server error",
		})
	}
}

/**
 * Delete a notification
 */
export const deleteNotificationById = async (req: Request, res: Response) => {
	try {
		const user_id = req.user?.document_id
		const { id } = req.params

		if (!user_id) {
			return res.status(401).json({ error: "Unauthorized" })
		}

		await deleteNotification(parseInt(id, 10), user_id)
		res.json({ message: "Notification deleted successfully" })
	} catch (error) {
		console.error("Error in deleteNotificationById:", error)
		res.status(500).json({
			error: error instanceof Error ? error.message : "Internal server error",
		})
	}
}

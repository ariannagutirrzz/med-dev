import { query } from "../db"
import { whatsAppService } from "./WhatsAppService"
import { getSettingsByUserId } from "./SettingsService"

interface NotificationOptions {
	userDocumentId: string
	email?: string
	phone?: string
}

/**
 * NotificationService
 * Coordinates WhatsApp notifications based on user preferences
 */
class NotificationService {
	/**
	 * Check if user has notifications enabled
	 */
	private async checkNotificationPreferences(
		userDocumentId: string,
		type: "email_notifications" | "appointment_reminders" | "inventory_alerts",
	): Promise<boolean> {
		try {
			const settings = await getSettingsByUserId(userDocumentId)
			if (!settings) {
				// Default to true if no settings found
				return true
			}
			return settings[type] === true
		} catch (error) {
			console.error("Error checking notification preferences:", error)
			// Default to true on error
			return true
		}
	}

	/**
	 * Get user contact information
	 */
	private async getUserContactInfo(
		userDocumentId: string,
	): Promise<{ email: string | null; phone: string | null }> {
		try {
			const result = await query(
				`SELECT email, phone FROM users WHERE document_id = $1`,
				[userDocumentId],
			)

			if (result.rows.length === 0) {
				return { email: null, phone: null }
			}

			return {
				email: result.rows[0].email || null,
				phone: result.rows[0].phone || null,
			}
		} catch (error) {
			console.error("Error fetching user contact info:", error)
			return { email: null, phone: null }
		}
	}

	/**
	 * Send appointment reminder
	 */
	async sendAppointmentReminder(
		userDocumentId: string,
		patientName: string,
		appointmentDate: Date,
		doctorName?: string,
		options?: NotificationOptions,
	): Promise<{ whatsappSent: boolean }> {
		const remindersEnabled = await this.checkNotificationPreferences(
			userDocumentId,
			"appointment_reminders",
		)

		if (!remindersEnabled) {
			return { whatsappSent: false }
		}

		// Get user contact info if not provided
		const contactInfo = options
			? { email: options.email || null, phone: options.phone || null }
			: await this.getUserContactInfo(userDocumentId)

		const results = {
			whatsappSent: false,
		}

		// Email sending is disabled for now
		// if (contactInfo.email) {
		// 	results.emailSent = await emailService.sendAppointmentReminder(...)
		// }

		// Send WhatsApp if available
		if (contactInfo.phone) {
			results.whatsappSent = await whatsAppService.sendAppointmentReminder(
				contactInfo.phone,
				patientName,
				appointmentDate,
				doctorName,
			)
		}

		return results
	}

	/**
	 * Send inventory alert
	 */
	async sendInventoryAlert(
		userDocumentId: string,
		supplyName: string,
		currentStock: number,
		minStock: number,
		options?: NotificationOptions,
	): Promise<{ whatsappSent: boolean }> {
		const alertsEnabled = await this.checkNotificationPreferences(
			userDocumentId,
			"inventory_alerts",
		)

		if (!alertsEnabled) {
			return { whatsappSent: false }
		}

		// Get user contact info if not provided
		const contactInfo = options
			? { email: options.email || null, phone: options.phone || null }
			: await this.getUserContactInfo(userDocumentId)

		const results = {
			whatsappSent: false,
		}

		// Email sending is disabled for now
		// if (contactInfo.email) {
		// 	results.emailSent = await emailService.sendInventoryAlert(...)
		// }

		// Send WhatsApp if available
		if (contactInfo.phone) {
			results.whatsappSent = await whatsAppService.sendInventoryAlert(
				contactInfo.phone,
				supplyName,
				currentStock,
				minStock,
			)
		}

		return results
	}

	/**
	 * Send general notification
	 */
	async sendGeneralNotification(
		userDocumentId: string,
		title: string,
		message: string,
		options?: NotificationOptions,
	): Promise<{ whatsappSent: boolean }> {
		const notificationsEnabled = await this.checkNotificationPreferences(
			userDocumentId,
			"email_notifications",
		)

		if (!notificationsEnabled) {
			return { whatsappSent: false }
		}

		// Get user contact info if not provided
		const contactInfo = options
			? { email: options.email || null, phone: options.phone || null }
			: await this.getUserContactInfo(userDocumentId)

		const results = {
			whatsappSent: false,
		}

		// Email sending is disabled for now
		// if (contactInfo.email) {
		// 	results.emailSent = await emailService.sendGeneralNotification(...)
		// }

		// Send WhatsApp if available
		if (contactInfo.phone) {
			results.whatsappSent = await whatsAppService.sendGeneralNotification(
				contactInfo.phone,
				title,
				message,
			)
		}

		return results
	}
}

// Export singleton instance
export const notificationService = new NotificationService()

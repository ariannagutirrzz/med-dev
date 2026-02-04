import { Router } from "express"
import { authenticate } from "../middleware/auth"
import { notificationService } from "../services/NotificationService"
import { whatsAppService } from "../services/WhatsAppService"

const testRoutes: Router = Router()

// All test routes require authentication
testRoutes.use(authenticate)

/**
 * Test WhatsApp message
 * POST /api/test/whatsapp
 * Body: { phone: string, message: string, contentSid?: string, contentVariables?: string }
 */
testRoutes.post("/whatsapp", async (req, res) => {
	try {
		const { phone, message, contentSid, contentVariables } = req.body

		if (!phone) {
			return res.status(400).json({
				error: "phone is required",
			})
		}

		// If using template (contentSid), message is optional
		if (!contentSid && !message) {
			return res.status(400).json({
				error: "message is required when not using contentSid",
			})
		}

		const result = await whatsAppService.sendMessage(phone, message || "", {
			contentSid,
			contentVariables,
		})

		if (result) {
			res.json({
				success: true,
				message: "WhatsApp message sent successfully",
			})
		} else {
			res.status(500).json({
				error: "Failed to send WhatsApp message. Check server logs.",
			})
		}
	} catch (error) {
		console.error("Error in test WhatsApp endpoint:", error)
		res.status(500).json({
			error: error instanceof Error ? error.message : "Internal server error",
		})
	}
})

/**
 * Test Appointment Reminder Notification
 * POST /api/test/appointment-reminder
 * Body: { phone?: string, email?: string }
 */
testRoutes.post("/appointment-reminder", async (req, res) => {
	try {
		const userDocumentId = req.user?.document_id

		if (!userDocumentId) {
			return res.status(401).json({ error: "User not authenticated" })
		}

		const { phone, email } = req.body

		// Create a test appointment date (1 day from now)
		const testDate = new Date()
		testDate.setDate(testDate.getDate() + 1)

		const result = await notificationService.sendAppointmentReminder(
			userDocumentId,
			req.user?.name || "Usuario de Prueba",
			testDate,
			"Dr. Test",
			{
				email: email || undefined,
				phone: phone || undefined,
				userDocumentId,
			},
		)

		res.json({
			success: true,
			message: "Test appointment reminder sent",
			results: result,
		})
	} catch (error) {
		console.error("Error in test appointment reminder:", error)
		res.status(500).json({
			error: error instanceof Error ? error.message : "Internal server error",
		})
	}
})

/**
 * Test Inventory Alert Notification
 * POST /api/test/inventory-alert
 * Body: { phone?: string, email?: string }
 */
testRoutes.post("/inventory-alert", async (req, res) => {
	try {
		const userDocumentId = req.user?.document_id

		if (!userDocumentId) {
			return res.status(401).json({ error: "User not authenticated" })
		}

		const { phone, email } = req.body

		const result = await notificationService.sendInventoryAlert(
			userDocumentId,
			"Insumo de Prueba",
			5,
			10,
			{
				email: email || undefined,
				phone: phone || undefined,
				userDocumentId,
			},
		)

		res.json({
			success: true,
			message: "Test inventory alert sent",
			results: result,
		})
	} catch (error) {
		console.error("Error in test inventory alert:", error)
		res.status(500).json({
			error: error instanceof Error ? error.message : "Internal server error",
		})
	}
})

export default testRoutes

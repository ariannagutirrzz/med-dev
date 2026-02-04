import twilio from "twilio"

/**
 * WhatsAppService
 * Handles sending WhatsApp messages via Twilio API
 */
class WhatsAppService {
	private client: twilio.Twilio | null = null
	private whatsappNumber: string

	constructor() {
		const accountSid = process.env.TWILIO_ACCOUNT_SID
		const authToken = process.env.TWILIO_AUTH_TOKEN
		this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886"

		if (accountSid && authToken) {
			this.client = twilio(accountSid, authToken)
		} else {
			console.warn(
				"WhatsApp service not configured. TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables are required.",
			)
		}
	}

	/**
	 * Send a WhatsApp message
	 * Supports both simple text messages and template messages
	 */
	async sendMessage(
		to: string,
		message: string,
		options?: {
			contentSid?: string
			contentVariables?: string
		},
	): Promise<boolean> {
		if (!this.client) {
			console.error("WhatsApp client not configured")
			return false
		}

		// Format phone number (add whatsapp: prefix if not present)
		const formattedTo = to.startsWith("whatsapp:")
			? to
			: `whatsapp:${to.replace(/^\+/, "")}`

		// Ensure phone number starts with country code
		const phoneNumber = formattedTo.startsWith("whatsapp:+")
			? formattedTo
			: `whatsapp:+${formattedTo.replace("whatsapp:", "")}`

		try {
			// If contentSid is provided, use template message
			if (options?.contentSid) {
				const messageOptions: {
					from: string
					to: string
					contentSid: string
					contentVariables?: string
				} = {
					from: this.whatsappNumber,
					to: phoneNumber,
					contentSid: options.contentSid,
				}

				if (options.contentVariables) {
					messageOptions.contentVariables = options.contentVariables
				}

				const result = await this.client.messages.create(messageOptions)
				console.log("WhatsApp template message sent successfully:", result.sid)
				return true
			} else {
				// Use simple text message
				const result = await this.client.messages.create({
					from: this.whatsappNumber,
					to: phoneNumber,
					body: message,
				})

				console.log("WhatsApp message sent successfully:", result.sid)
				return true
			}
		} catch (error) {
			console.error("Error sending WhatsApp message:", error)
			if (error instanceof Error) {
				console.error("Error details:", error.message)
			}
			return false
		}
	}

	/**
	 * Send appointment reminder via WhatsApp
	 */
	async sendAppointmentReminder(
		to: string,
		patientName: string,
		appointmentDate: Date,
		doctorName?: string,
	): Promise<boolean> {
		const formattedDate = new Date(appointmentDate).toLocaleString("es-ES", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		})

		const message = `🏥 *Unidad de Pleura*\n\n` +
			`Hola ${patientName},\n\n` +
			`Le recordamos que tiene una cita programada:\n\n` +
			`📅 *Fecha y Hora:* ${formattedDate}\n` +
			(doctorName ? `👨‍⚕️ *Médico:* ${doctorName}\n` : "") +
			`\nPor favor, asegúrese de llegar puntualmente.\n\n` +
			`Si necesita cancelar o reprogramar su cita, por favor contáctenos con anticipación.\n\n` +
			`_Este es un mensaje automático._`

		return this.sendMessage(to, message)
	}

	/**
	 * Send inventory alert via WhatsApp
	 */
	async sendInventoryAlert(
		to: string,
		supplyName: string,
		currentStock: number,
		minStock: number,
	): Promise<boolean> {
		const message = `⚠️ *Alerta de Inventario - Unidad de Pleura*\n\n` +
			`*Stock Bajo Detectado*\n\n` +
			`📦 *Insumo:* ${supplyName}\n` +
			`📊 *Stock Actual:* ${currentStock}\n` +
			`📉 *Stock Mínimo Requerido:* ${minStock}\n\n` +
			`Por favor, proceda a reponer el inventario lo antes posible.\n\n` +
			`_Este es un mensaje automático del sistema de gestión._`

		return this.sendMessage(to, message)
	}

	/**
	 * Send general notification via WhatsApp
	 */
	async sendGeneralNotification(
		to: string,
		title: string,
		message: string,
	): Promise<boolean> {
		const fullMessage = `🏥 *Unidad de Pleura*\n\n` +
			`*${title}*\n\n` +
			`${message}\n\n` +
			`_Este es un mensaje automático._`

		return this.sendMessage(to, fullMessage)
	}
}

// Export singleton instance
export const whatsAppService = new WhatsAppService()

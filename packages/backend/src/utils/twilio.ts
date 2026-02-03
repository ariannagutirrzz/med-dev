import twilio from "twilio"
import dotenv from "dotenv"

dotenv.config()

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
// For WhatsApp, use TWILIO_WHATSAPP_NUMBER (format: whatsapp:+14155238886)
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER

if (!accountSid || !authToken) {
	console.warn(
		"Twilio credentials not found. WhatsApp notifications will be disabled.",
	)
}

const client = accountSid && authToken ? twilio(accountSid, authToken) : null

export interface WhatsAppOptions {
	to: string
	message: string
}

/**
 * Sends a WhatsApp message using Twilio
 * @param options - WhatsApp options containing recipient phone number and message
 * @returns Promise that resolves to the message SID if successful, null otherwise
 */
export async function sendWhatsApp(
	options: WhatsAppOptions,
): Promise<string | null> {
	if (!client) {
		console.warn("Twilio client not initialized. WhatsApp not sent.")
		return null
	}

	if (!twilioWhatsAppNumber) {
		console.warn("Twilio WhatsApp number not configured. WhatsApp not sent.")
		return null
	}

	try {
		// Format phone number to WhatsApp format (whatsapp:+1234567890)
		const formattedTo = formatWhatsAppNumber(options.to)

		if (!formattedTo) {
			console.error(`Invalid phone number format: ${options.to}`)
			return null
		}

		const message = await client.messages.create({
			body: options.message,
			from: twilioWhatsAppNumber,
			to: formattedTo,
		})

		console.log(`WhatsApp sent successfully. SID: ${message.sid}`)
		return message.sid
	} catch (error) {
		console.error("Error sending WhatsApp:", error)
		return null
	}
}

// Keep sendSMS as an alias for backward compatibility, but it will send WhatsApp
export async function sendSMS(options: WhatsAppOptions): Promise<string | null> {
	return sendWhatsApp(options)
}

/**
 * Formats a phone number to WhatsApp format (whatsapp:+1234567890)
 * @param phoneNumber - Phone number in various formats
 * @returns Formatted WhatsApp number or null if invalid
 */
function formatWhatsAppNumber(phoneNumber: string): string | null {
	if (!phoneNumber) return null

	// Remove all non-digit characters except +
	let cleaned = phoneNumber.replace(/[^\d+]/g, "")

	// If it already starts with whatsapp:, extract the number part
	if (phoneNumber.toLowerCase().startsWith("whatsapp:")) {
		cleaned = phoneNumber.replace(/^whatsapp:/i, "").replace(/[^\d+]/g, "")
	}

	// If it already starts with +, use it as is
	if (cleaned.startsWith("+")) {
		const digitsOnly = cleaned.replace("+", "")
		// Basic validation: should be between 7-15 digits after +
		if (digitsOnly.length < 7 || digitsOnly.length > 15) {
			return null
		}
		return `whatsapp:${cleaned}`
	}

	// If no + prefix, try to add it
	// For safety, if no + and we can't determine, return null
	// The caller should ensure phone numbers are stored in E.164 format
	if (cleaned.length >= 7 && cleaned.length <= 15) {
		// Assume it might be missing the +, but has country code
		return `whatsapp:+${cleaned}`
	}

	return null
}

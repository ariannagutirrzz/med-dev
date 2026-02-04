import { query } from "../db"
import type { CreateSettingsInput, UpdateSettingsInput } from "../schemas/settingsSchema"

/**
 * SettingsService
 * Single Responsibility: Handle all database operations for user settings
 * Following SOLID principles - Separation of Concerns
 */

/**
 * Get user settings by document_id
 */
export async function getSettingsByUserId(
	userDocumentId: string,
): Promise<Settings | null> {
	try {
		const result = await query(
			`SELECT 
				id,
				user_document_id,
				email_notifications,
				appointment_reminders,
				inventory_alerts,
				language,
				theme,
				created_at,
				updated_at
			FROM user_settings 
			WHERE user_document_id = $1`,
			[userDocumentId],
		)

		if (result.rows.length === 0) {
			return null
		}

		return result.rows[0] as Settings
	} catch (error) {
		console.error("Error fetching settings:", error)
		throw new Error("Failed to fetch user settings")
	}
}

/**
 * Create default settings for a user
 */
export async function createSettings(
	input: CreateSettingsInput,
): Promise<Settings> {
	try {
		const result = await query(
			`INSERT INTO user_settings 
			(user_document_id, email_notifications, appointment_reminders, inventory_alerts, language, theme)
			VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING *`,
			[
				input.user_document_id,
				input.email_notifications ?? true,
				input.appointment_reminders ?? true,
				input.inventory_alerts ?? true,
				input.language ?? "es",
				input.theme ?? "light",
			],
		)

		return result.rows[0] as Settings
	} catch (error) {
		console.error("Error creating settings:", error)
		throw new Error("Failed to create user settings")
	}
}

/**
 * Update user settings
 */
export async function updateSettings(
	userDocumentId: string,
	input: UpdateSettingsInput,
): Promise<Settings> {
	try {
		// Build dynamic update query based on provided fields
		const fields = Object.keys(input)
		if (fields.length === 0) {
			throw new Error("No fields provided for update")
		}

		const setClause = fields
			.map((field, index) => `${field} = $${index + 1}`)
			.join(", ")

		const values: unknown[] = Object.values(input)
		values.push(userDocumentId)

		const result = await query(
			`UPDATE user_settings 
			SET ${setClause}, updated_at = CURRENT_TIMESTAMP
			WHERE user_document_id = $${values.length}
			RETURNING *`,
			values,
		)

		if (result.rows.length === 0) {
			throw new Error("Settings not found")
		}

		return result.rows[0] as Settings
	} catch (error) {
		console.error("Error updating settings:", error)
		throw new Error("Failed to update user settings")
	}
}

/**
 * Get or create settings (ensures user always has settings)
 */
export async function getOrCreateSettings(
	userDocumentId: string,
): Promise<Settings> {
	let settings = await getSettingsByUserId(userDocumentId)

	if (!settings) {
		settings = await createSettings({
			user_document_id: userDocumentId,
			email_notifications: true,
			appointment_reminders: true,
			inventory_alerts: true,
			language: "es",
			theme: "light",
		})
	}

	return settings
}

// Type definition for Settings
export interface Settings {
	id: number
	user_document_id: string
	email_notifications: boolean
	appointment_reminders: boolean
	inventory_alerts: boolean
	language: "es" | "en"
	theme: "light" | "dark"
	created_at: Date
	updated_at: Date
}

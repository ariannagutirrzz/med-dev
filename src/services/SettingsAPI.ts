import { isAxiosError } from "axios"
import { api } from "../config/axios"

export interface UserSettings {
	id: number
	user_document_id: string
	email_notifications: boolean
	appointment_reminders: boolean
	inventory_alerts: boolean
	language: "es" | "en"
	theme: "light" | "dark"
	created_at: string
	updated_at: string
}

export interface UpdateSettingsInput {
	email_notifications?: boolean
	appointment_reminders?: boolean
	inventory_alerts?: boolean
	language?: "es" | "en"
	theme?: "light" | "dark"
}

/**
 * SettingsAPI Service
 * Following DRY principle - centralized API calls for settings
 */

/**
 * Get current user's settings
 */
export async function getSettings(): Promise<UserSettings> {
	try {
		const { data } = await api.get<{ settings: UserSettings; message: string }>(
			"/settings",
		)
		return data.settings
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(
				error.response.data.error || "Failed to fetch settings",
			)
		}
		throw new Error("Failed to fetch settings")
	}
}

/**
 * Update current user's settings
 */
export async function updateSettings(
	updates: UpdateSettingsInput,
): Promise<UserSettings> {
	try {
		const { data } = await api.patch<{
			settings: UserSettings
			message: string
		}>("/settings", updates)
		return data.settings
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(
				error.response.data.error || "Failed to update settings",
			)
		}
		throw new Error("Failed to update settings")
	}
}

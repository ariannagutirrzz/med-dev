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
	// Tasa de cambio personalizada por usuario (médico)
	custom_exchange_rate: number | null
	created_at: string
	updated_at: string
}

export interface UpdateSettingsInput {
	email_notifications?: boolean
	appointment_reminders?: boolean
	inventory_alerts?: boolean
	language?: "es" | "en"
	theme?: "light" | "dark"
	custom_exchange_rate?: number | null
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
		// Asegurar que custom_exchange_rate sea un número o null
		if (data.settings.custom_exchange_rate != null) {
			data.settings.custom_exchange_rate =
				typeof data.settings.custom_exchange_rate === "string"
					? parseFloat(data.settings.custom_exchange_rate)
					: Number(data.settings.custom_exchange_rate)
		}
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
		// Asegurar que custom_exchange_rate sea un número o null
		if (data.settings.custom_exchange_rate != null) {
			data.settings.custom_exchange_rate =
				typeof data.settings.custom_exchange_rate === "string"
					? parseFloat(data.settings.custom_exchange_rate)
					: Number(data.settings.custom_exchange_rate)
		}
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

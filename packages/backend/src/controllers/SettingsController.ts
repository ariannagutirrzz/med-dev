import type { Request, Response } from "express"
import { updateSettingsSchema } from "../schemas/settingsSchema"
import {
	getOrCreateSettings,
	updateSettings as updateUserSettings,
} from "../services/SettingsService"

/**
 * SettingsController
 * Single Responsibility: Handle HTTP requests/responses for settings
 * Delegates business logic to SettingsService (Dependency Inversion Principle)
 */

/**
 * Get current user's settings
 * GET /api/settings
 */
export const getSettings = async (req: Request, res: Response) => {
	try {
		const userDocumentId = req.user?.document_id

		if (!userDocumentId) {
			return res.status(401).json({ error: "User not authenticated" })
		}

		const settings = await getOrCreateSettings(userDocumentId)

		res.json({
			settings,
			message: "Settings retrieved successfully",
		})
	} catch (error) {
		console.error("Error in getSettings:", error)
		res.status(500).json({
			error: error instanceof Error ? error.message : "Internal server error",
		})
	}
}

/**
 * Update current user's settings
 * PATCH /api/settings
 */
export const updateSettings = async (req: Request, res: Response) => {
	try {
		const userDocumentId = req.user?.document_id

		if (!userDocumentId) {
			return res.status(401).json({ error: "User not authenticated" })
		}

		// Validate input
		const validationResult = updateSettingsSchema.safeParse(req.body)
		if (!validationResult.success) {
			return res.status(400).json({
				error: "Invalid input",
				details: validationResult.error.errors,
			})
		}

		const updatedSettings = await updateUserSettings(
			userDocumentId,
			validationResult.data,
		)

		res.json({
			settings: updatedSettings,
			message: "Settings updated successfully",
		})
	} catch (error) {
		console.error("Error in updateSettings:", error)
		res.status(500).json({
			error: error instanceof Error ? error.message : "Internal server error",
		})
	}
}

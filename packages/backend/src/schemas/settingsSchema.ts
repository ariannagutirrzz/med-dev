import { z } from "zod"

// Schema for updating user settings
export const updateSettingsSchema = z.object({
	email_notifications: z.boolean().optional(),
	appointment_reminders: z.boolean().optional(),
	inventory_alerts: z.boolean().optional(),
	language: z.enum(["es", "en"]).optional(),
	theme: z.enum(["light", "dark"]).optional(),
})

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>

// Schema for creating default settings
export const createSettingsSchema = z.object({
	user_document_id: z.string().min(1),
	email_notifications: z.boolean().default(true),
	appointment_reminders: z.boolean().default(true),
	inventory_alerts: z.boolean().default(true),
	language: z.enum(["es", "en"]).default("es"),
	theme: z.enum(["light", "dark"]).default("light"),
})

export type CreateSettingsInput = z.infer<typeof createSettingsSchema>

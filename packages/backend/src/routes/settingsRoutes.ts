import { Router } from "express"
import { getSettings, updateSettings } from "../controllers/SettingsController"
import { authenticate } from "../middleware/auth"

/**
 * Settings Routes
 * All routes require authentication
 */

const settingsRoutes: Router = Router()

settingsRoutes.use(authenticate)

// Get current user's settings
settingsRoutes.get("/", getSettings)

// Update current user's settings
settingsRoutes.patch("/", updateSettings)

export default settingsRoutes

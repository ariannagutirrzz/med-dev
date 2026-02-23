import type { Router } from "express"
import { Router as createRouter } from "express"
import { chatStream } from "../controllers/AiController"
import { authenticate } from "../middleware/auth"

const aiRoutes: Router = createRouter()

aiRoutes.post("/chat", authenticate, chatStream)

export default aiRoutes

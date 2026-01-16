import { Router } from "express"
import { createAccount, login } from "../controllers/AuthController"

const authRoutes: Router = Router()

// Signup endpoint
authRoutes.post("/signup", createAccount)
authRoutes.post("/login", login)
export default authRoutes

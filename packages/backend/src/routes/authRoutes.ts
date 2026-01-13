import { Router } from "express";
import { AuthController } from "../controllers/AuthController";

const authRoutes: Router = Router();

// Signup endpoint
authRoutes.post("/signup", AuthController.createAccount);
authRoutes.post("/login", AuthController.login);
export default authRoutes;

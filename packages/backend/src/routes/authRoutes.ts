import { AuthController } from "./../controllers/AuthController";
import { Router } from "express";

const authRoutes: Router = Router();

// Signup endpoint
authRoutes.post("/signup", AuthController.createAccount);
authRoutes.post("/login", AuthController.login);
export default authRoutes;

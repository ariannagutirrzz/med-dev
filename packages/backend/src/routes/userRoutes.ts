import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authenticate } from "../middleware/auth";

const userRoutes: Router = Router();

userRoutes.use(authenticate);

userRoutes.get("/", UserController.getAllUsers);

export default userRoutes;

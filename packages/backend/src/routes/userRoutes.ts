import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authenticate } from "../middleware/auth";

const userRoutes: Router = Router();

userRoutes.use(authenticate);

userRoutes.get("/", UserController.getAllUsers);
userRoutes.get("/:id", UserController.getUserByDocumentId);
userRoutes.patch("/:id", UserController.updateUser);
userRoutes.delete("/:id", UserController.deleteUser);

export default userRoutes;

import { Router } from "express";
import { AppointmentController } from "../controllers/AppointmentController";
import { authenticate } from "../middleware/auth";
import { isMedic } from "../middleware/roleAuth";

const appointmentRoutes: Router = Router();

appointmentRoutes.use(authenticate);

appointmentRoutes.post("/", AppointmentController.createAppointment);
appointmentRoutes.get("/", AppointmentController.getAllAppointments);
appointmentRoutes.get("/:id", AppointmentController.getAppointmentById);
appointmentRoutes.patch("/:id", AppointmentController.updateAppointment);
appointmentRoutes.delete(
  "/:id",
  isMedic,
  AppointmentController.deleteAppointment
);

export default appointmentRoutes;

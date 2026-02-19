import { Router } from "express"
import {
	getNotifications,
	getUnreadCount,
	markAsRead,
	markAllAsRead,
	deleteNotificationById,
} from "../controllers/NotificationController"
import { authenticate } from "../middleware/auth"

const notificationRoutes: Router = Router()

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Obtener todas las notificaciones del usuario autenticado
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de notificaciones
 *       401:
 *         description: No autorizado
 */
notificationRoutes.get("/", authenticate, getNotifications)

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Obtener el conteo de notificaciones no leídas
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conteo de notificaciones no leídas
 *       401:
 *         description: No autorizado
 */
notificationRoutes.get("/unread-count", authenticate, getUnreadCount)

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Marcar una notificación como leída
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notificación marcada como leída
 *       401:
 *         description: No autorizado
 */
notificationRoutes.patch("/:id/read", authenticate, markAsRead)

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     summary: Marcar todas las notificaciones como leídas
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas las notificaciones marcadas como leídas
 *       401:
 *         description: No autorizado
 */
notificationRoutes.patch("/read-all", authenticate, markAllAsRead)

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Eliminar una notificación
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notificación eliminada exitosamente
 *       401:
 *         description: No autorizado
 */
notificationRoutes.delete("/:id", authenticate, deleteNotificationById)

export default notificationRoutes

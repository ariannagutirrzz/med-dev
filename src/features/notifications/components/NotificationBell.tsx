import { useEffect, useRef, useState } from "react"
import { HiOutlineBellAlert } from "react-icons/hi2"
import { toast } from "react-toastify"
import {
	deleteNotification,
	getNotifications,
	getUnreadCount,
	markAllAsRead,
	markAsRead,
	type Notification,
} from "../services/NotificationsAPI"

export default function NotificationBell() {
	const [notifications, setNotifications] = useState<Notification[]>([])
	const [unreadCount, setUnreadCount] = useState(0)
	const [isOpen, setIsOpen] = useState(false)
	const [loading, setLoading] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	// Fetch notifications and unread count
	const fetchNotifications = async () => {
		try {
			setLoading(true)
			const [notificationsData, count] = await Promise.all([
				getNotifications(),
				getUnreadCount(),
			])
			setNotifications(notificationsData)
			setUnreadCount(count)
		} catch (error) {
			console.error("Error fetching notifications:", error)
		} finally {
			setLoading(false)
		}
	}

	// Initial fetch and polling
	useEffect(() => {
		fetchNotifications()

		// Poll every 30 seconds for new notifications
		const interval = setInterval(fetchNotifications, 30000)

		return () => clearInterval(interval)
	}, [])

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false)
			}
		}

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside)
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [isOpen])

	const handleNotificationClick = async (notification: Notification) => {
		if (!notification.read) {
			try {
				await markAsRead(notification.id)
				setNotifications((prev) =>
					prev.map((n) =>
						n.id === notification.id ? { ...n, read: true } : n,
					),
				)
				setUnreadCount((prev) => Math.max(0, prev - 1))
			} catch (error) {
				console.error("Error marking notification as read:", error)
				toast.error("Error al marcar la notificación como leída")
			}
		}
	}

	const handleMarkAllAsRead = async () => {
		try {
			await markAllAsRead()
			setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
			setUnreadCount(0)
			toast.success("Todas las notificaciones marcadas como leídas")
		} catch (error) {
			console.error("Error marking all as read:", error)
			toast.error("Error al marcar todas como leídas")
		}
	}

	const handleDeleteNotification = async (
		e: React.MouseEvent,
		notificationId: number,
	) => {
		e.stopPropagation()
		try {
			await deleteNotification(notificationId)
			setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
			// Update unread count if deleted notification was unread
			const deleted = notifications.find((n) => n.id === notificationId)
			if (deleted && !deleted.read) {
				setUnreadCount((prev) => Math.max(0, prev - 1))
			}
		} catch (error) {
			console.error("Error deleting notification:", error)
			toast.error("Error al eliminar la notificación")
		}
	}

	const getNotificationIcon = (type: Notification["type"]) => {
		switch (type) {
			case "success":
				return "✅"
			case "warning":
				return "⚠️"
			case "error":
				return "❌"
			default:
				return "ℹ️"
		}
	}

	const formatTimeAgo = (dateString: string) => {
		const date = new Date(dateString)
		const now = new Date()
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

		if (diffInSeconds < 60) return "Hace un momento"
		if (diffInSeconds < 3600)
			return `Hace ${Math.floor(diffInSeconds / 60)} minutos`
		if (diffInSeconds < 86400)
			return `Hace ${Math.floor(diffInSeconds / 3600)} horas`
		if (diffInSeconds < 604800)
			return `Hace ${Math.floor(diffInSeconds / 86400)} días`
		return date.toLocaleDateString("es-ES")
	}

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="relative p-1 sm:p-1.5 md:p-2 text-gray-400 hover:text-primary transition-colors cursor-pointer flex items-center justify-center"
				aria-label="Notificaciones"
			>
				<HiOutlineBellAlert className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
				{unreadCount > 0 && (
					<span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 text-xs font-bold text-white bg-red-500 rounded-full text-[10px] sm:text-xs">
						{unreadCount > 9 ? "9+" : unreadCount}
					</span>
				)}
			</button>

			{isOpen && (
				<div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
					{/* Header */}
					<div className="flex items-center justify-between p-4 border-b border-gray-200">
						<h3 className="text-lg font-semibold text-gray-800">
							Notificaciones
						</h3>
						{unreadCount > 0 && (
							<button
								type="button"
								onClick={handleMarkAllAsRead}
								className="text-sm text-primary hover:text-primary-dark font-medium"
							>
								Marcar todas como leídas
							</button>
						)}
					</div>

					{/* Notifications List */}
					<div className="overflow-y-auto flex-1">
						{loading ? (
							<div className="p-4 text-center text-gray-500">Cargando...</div>
						) : notifications.length === 0 ? (
							<div className="p-8 text-center text-gray-500">
								<p>No tienes notificaciones</p>
							</div>
						) : (
							<div className="divide-y divide-gray-100">
								{notifications.map((notification) => (
									<div
										key={notification.id}
										onClick={() => handleNotificationClick(notification)}
										className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
											!notification.read ? "bg-blue-50" : ""
										}`}
									>
										<div className="flex items-start justify-between gap-2">
											<div className="flex items-start gap-3 flex-1">
												<span className="text-xl mt-0.5">
													{getNotificationIcon(notification.type)}
												</span>
												<div className="flex-1 min-w-0">
													<h4
														className={`text-sm font-semibold ${
															!notification.read
																? "text-gray-900"
																: "text-gray-600"
														}`}
													>
														{notification.title}
													</h4>
													<p className="text-sm text-gray-600 mt-1">
														{notification.message}
													</p>
													<p className="text-xs text-gray-400 mt-2">
														{formatTimeAgo(notification.created_at)}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-2">
												{!notification.read && (
													<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
												)}
												<button
													type="button"
													onClick={(e) =>
														handleDeleteNotification(e, notification.id)
													}
													className="text-gray-400 hover:text-red-500 transition-colors p-1"
													aria-label="Eliminar notificación"
												>
													×
												</button>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}

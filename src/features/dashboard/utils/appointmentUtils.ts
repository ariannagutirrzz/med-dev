import type { Appointment } from "../../../shared"

/**
 * Utility functions for appointment filtering and processing
 */

export const getUpcomingAppointments = (
	appointments: Appointment[],
	limit: number = 5,
): Appointment[] => {
	const now = new Date()
	now.setHours(0, 0, 0, 0)

	return appointments
		.filter((apt) => {
			if (!apt.appointment_date) return false
			const aptDate = new Date(apt.appointment_date)
			aptDate.setHours(0, 0, 0, 0)
			const status = apt.status?.toLowerCase()
			return (
				aptDate >= now &&
				status !== "cancelled" &&
				status !== "completed"
			)
		})
		.sort(
			(a, b) =>
				new Date(a.appointment_date).getTime() -
				new Date(b.appointment_date).getTime(),
		)
		.slice(0, limit)
}

export const getAppointmentStatusBadge = (status?: string) => {
	const statusLower = status?.toLowerCase() || "pending"
	
	if (statusLower === "scheduled") {
		return {
			className: "bg-green-100 text-green-700",
			label: "Programada",
		}
	}
	if (statusLower === "pending") {
		return {
			className: "bg-yellow-100 text-yellow-700",
			label: "Pendiente",
		}
	}
	return {
		className: "bg-gray-100 text-gray-600",
		label: status || "Pendiente",
	}
}

/**
 * Utility functions for date operations in the dashboard
 */

export const getTodayRange = () => {
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	const tomorrow = new Date(today)
	tomorrow.setDate(tomorrow.getDate() + 1)
	return { today, tomorrow }
}

export const isDateToday = (date: Date | string): boolean => {
	const { today, tomorrow } = getTodayRange()
	const dateObj = typeof date === "string" ? new Date(date) : date
	return dateObj >= today && dateObj < tomorrow
}

export const formatAppointmentDate = (date: string) => {
	return new Date(date).toLocaleDateString("es-ES", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	})
}

export const formatFullDate = (date: string) => {
	return new Date(date).toLocaleDateString("es-ES", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	})
}

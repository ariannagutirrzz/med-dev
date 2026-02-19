export interface DashboardStats {
	appointmentsToday: number
	totalAppointments: number
	activePatients: number
	totalSurgeries: number
	surgeriesToday: number
}

export interface DashboardData {
	appointments: any[]
	surgeries: any[]
	patients: any[]
	stats: DashboardStats
	calendarSurgeries: any[]
}

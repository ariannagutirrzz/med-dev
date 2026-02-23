export interface DashboardStats {
	appointmentsToday: number
	totalAppointments: number
	activePatients: number
	totalSurgeries: number
	totalLowStockSupplies: number
	surgeriesToday: number
}

export interface DashboardData {
	appointments: any[]
	surgeries: any[]
	patients: any[]
	supplies: any[]
	stats: DashboardStats
	calendarSurgeries: any[]
}

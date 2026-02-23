import type { Appointment, Patient, Surgery } from "../../../shared"
import { getFilteredAppointments } from "../../appointments"
import { getLowStockSupplies } from "../../inventory"
import { getDoctorPatients } from "../../patients"
import { getSurgeries } from "../../surgeries"
import type { DashboardStats } from "../types/dashboard.types"
import { getTodayRange } from "../utils/dateUtils"
import {
	convertSurgeriesToCalendarFormat,
	filterSurgeriesByDoctor,
} from "../utils/surgeryUtils"

export interface DashboardDataResult {
	appointments: Appointment[]
	surgeries: Surgery[]
	patients: Patient[]
	stats: DashboardStats
	calendarSurgeries: ReturnType<typeof convertSurgeriesToCalendarFormat>
}

export const fetchDashboardData = async (
	userRole?: string,
	doctorId?: string,
): Promise<DashboardDataResult> => {
	const { today, tomorrow } = getTodayRange()

	// Fetch appointments
	let appointments: Appointment[] = []
	try {
		const appointmentsData = await getFilteredAppointments()
		appointments = appointmentsData.appointments || []
	} catch (error) {
		console.error("Error cargando citas:", error)
	}

	// Fetch patients (only for doctors)
	let patients: Patient[] = []
	if (userRole === "Médico") {
		try {
			const patientsData = await getDoctorPatients()
			patients = (patientsData?.patients || []) as Patient[]
		} catch (error) {
			console.error("Error cargando pacientes:", error)
		}
	}

	// Fetch surgeries (for Médico: all/filtered by doctor; for Paciente: only their own via API)
	let surgeries: Surgery[] = []
	if (userRole === "Médico") {
		try {
			const surgeriesData = await getSurgeries()
			if (doctorId && surgeriesData.surgeries) {
				surgeries = filterSurgeriesByDoctor(surgeriesData.surgeries, doctorId)
			} else {
				surgeries = surgeriesData.surgeries || []
			}
		} catch (error) {
			console.error("Error cargando cirugías:", error)
		}
	} else if (userRole === "Paciente") {
		try {
			const surgeriesData = await getSurgeries()
			surgeries = surgeriesData.surgeries || []
		} catch (error) {
			console.error("Error cargando cirugías del paciente:", error)
		}
	}

	// Fetch supplies (only for doctors)
	let supplies = 0
	if (userRole === "Médico") {
		try {
			const suppliesData = await getLowStockSupplies()
			supplies = suppliesData.count
		} catch (error) {
			console.error("Error cargando cirugías:", error)
		}
	}

	// Calculate stats
	const appointmentsToday = appointments.filter((apt) => {
		const aptDate = new Date(apt.appointment_date)
		return aptDate >= today && aptDate < tomorrow
	}).length

	const surgeriesToday = surgeries.filter((surgery) => {
		const surgeryDate = new Date(surgery.surgery_date)
		return surgeryDate >= today && surgeryDate < tomorrow
	}).length

	const stats: DashboardStats = {
		appointmentsToday,
		totalAppointments: appointments.length,
		activePatients: patients.length,
		totalLowStockSupplies: supplies,
		totalSurgeries: surgeries.length,
		surgeriesToday,
	}

	// Convert surgeries to calendar format
	const calendarSurgeries = convertSurgeriesToCalendarFormat(surgeries)

	return {
		appointments,
		surgeries,
		patients,
		stats,
		calendarSurgeries,
	}
}

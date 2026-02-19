import { useMemo } from "react"
import { useAuth } from "../../auth"
import type { Appointment, Patient, Surgery } from "../../../shared"

interface UseSearchFilterProps {
	searchTerm: string
	appointments: Appointment[]
	surgeries: Surgery[]
	patients: Patient[]
}

export const useSearchFilter = ({
	searchTerm,
	appointments,
	surgeries,
	patients,
}: UseSearchFilterProps) => {
	const { user } = useAuth()

	const filteredData = useMemo(() => {
		if (!searchTerm.trim()) {
			return {
				appointments: [],
				surgeries: [],
				patients: [],
				hasResults: false,
			}
		}

		const searchLower = searchTerm.toLowerCase().trim()

		const filteredAppointments = appointments.filter((apt) => {
			return (
				apt.patient_name?.toLowerCase().includes(searchLower) ||
				apt.doctor_name?.toLowerCase().includes(searchLower) ||
				apt.notes?.toLowerCase().includes(searchLower) ||
				apt.status?.toLowerCase().includes(searchLower)
			)
		})

		const filteredSurgeries =
			user?.role === "Médico"
				? surgeries.filter((surgery) => {
						const patientName = `${surgery.patient_first_name || ""} ${surgery.patient_last_name || ""}`.toLowerCase()
						return (
							patientName.includes(searchLower) ||
							surgery.doctor_name?.toLowerCase().includes(searchLower) ||
							surgery.surgery_type?.toLowerCase().includes(searchLower) ||
							surgery.notes?.toLowerCase().includes(searchLower) ||
							surgery.status?.toLowerCase().includes(searchLower)
						)
					})
				: []

		const filteredPatients =
			user?.role === "Médico"
				? patients.filter((patient) => {
						const fullName = `${patient.first_name || ""} ${patient.last_name || ""}`.toLowerCase()
						return (
							fullName.includes(searchLower) ||
							patient.email?.toLowerCase().includes(searchLower) ||
							patient.document_id?.toLowerCase().includes(searchLower) ||
							patient.phone?.toLowerCase().includes(searchLower)
						)
					})
				: []

		return {
			appointments: filteredAppointments,
			surgeries: filteredSurgeries,
			patients: filteredPatients,
			hasResults:
				filteredAppointments.length > 0 ||
				filteredSurgeries.length > 0 ||
				filteredPatients.length > 0,
		}
	}, [searchTerm, appointments, surgeries, patients, user?.role])

	return filteredData
}

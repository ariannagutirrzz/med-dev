import { api } from "../../../config/axios"
import type { AppointmentFormData } from "../../../shared"

export async function createAppointment(formData: AppointmentFormData) {
	const { data } = await api.post("/appointments", formData)
	return data
}

export async function getAllAppointments() {
	const { data } = await api.get("/appointments")
	return data
}

export async function getFilteredAppointments() {
	const { data } = await api.get("/appointments/filtered")
	return data
}

export async function getAppointmentById(id: number) {
	const { data } = await api.get(`/appointments/${id}`)
	return data
}

export async function updateAppointmentById(
	id: number,
	formData: Partial<AppointmentFormData>,
) {
	const { data } = await api.patch(`/appointments/${id}`, formData)
	return data
}

export async function deleteAppointmentById(id: number) {
	const { data } = await api.delete(`/appointments/${id}`)
	return data
}

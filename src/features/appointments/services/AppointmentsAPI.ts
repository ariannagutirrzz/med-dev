import { isAxiosError } from "axios"
import { api } from "../../../config/axios"
import type { Appointment, AppointmentFormData } from "../../../shared"

export async function createAppointment(formData: AppointmentFormData) {
	try {
		const { data } = await api.post("/appointments", formData)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
		throw error
	}
}

export async function getAppointments() {
	try {
		const { data } = await api.get("/appointments")
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
		throw error
	}
}

export async function getAppointmentById(id: number) {
	try {
		const { data } = await api.get(`/appointments/${id}`)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
		throw error
	}
}

export async function updateAppointmentById(
	id: number,
	formData: Partial<AppointmentFormData>,
) {
	try {
		const { data } = await api.patch(`/appointments/${id}`, formData)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
		throw error
	}
}

export async function deleteAppointmentById(id: number) {
	try {
		const { data } = await api.delete(`/appointments/${id}`)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
		throw error
	}
}

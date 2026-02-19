import { isAxiosError } from "axios"
import { api } from "../../../config/axios"

export interface DoctorAvailability {
	id: number
	doctor_id: string
	day_of_week: number // 0 = Sunday, 6 = Saturday
	start_time: string // HH:MM format
	end_time: string // HH:MM format
	is_active: boolean
	created_at?: string
	updated_at?: string
}

export interface DoctorAvailabilityFormData {
	day_of_week: number
	start_time: string
	end_time: string
	is_active?: boolean
}

export async function createDoctorAvailability(
	formData: DoctorAvailabilityFormData,
) {
	try {
		const { data } = await api.post("/doctor-availability", formData)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
		throw error
	}
}

export async function getDoctorAvailability(doctorId: string) {
	try {
		const { data } = await api.get(`/doctor-availability/${doctorId}`)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
		throw error
	}
}

export async function getAvailableTimeSlots(doctorId: string, date: string) {
	try {
		const { data } = await api.get(
			`/doctor-availability/${doctorId}/available-slots?date=${date}`,
		)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
		throw error
	}
}

export async function updateDoctorAvailability(
	id: number,
	formData: Partial<DoctorAvailabilityFormData>,
) {
	try {
		const { data } = await api.patch(`/doctor-availability/${id}`, formData)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
		throw error
	}
}

export async function deleteDoctorAvailability(id: number) {
	try {
		const { data } = await api.delete(`/doctor-availability/${id}`)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
		throw error
	}
}

import { isAxiosError } from "axios"
import { api } from "../../../config/axios"

export interface DoctorUnavailability {
	id: number
	doctor_id: string
	start_date: string // YYYY-MM-DD format
	end_date: string | null // YYYY-MM-DD format or null for single day
	reason: string | null
	is_active: boolean
	created_at?: string
	updated_at?: string
}

export interface DoctorUnavailabilityFormData {
	start_date: string // YYYY-MM-DD format
	end_date?: string | null // YYYY-MM-DD format or null for single day
	reason?: string | null
	is_active?: boolean
}

export async function createDoctorUnavailability(
	formData: DoctorUnavailabilityFormData,
) {
	try {
		const { data } = await api.post("/doctor-unavailability", formData)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
		throw error
	}
}

export async function getDoctorUnavailability(doctorId: string) {
	try {
		const { data } = await api.get(`/doctor-unavailability/${doctorId}`)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
		throw error
	}
}

export async function checkDateUnavailable(doctorId: string, date: string) {
	try {
		const { data } = await api.get(
			`/doctor-unavailability/${doctorId}/check?date=${date}`,
		)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
		throw error
	}
}

export async function updateDoctorUnavailability(
	id: number,
	formData: Partial<DoctorUnavailabilityFormData>,
) {
	try {
		const { data } = await api.patch(`/doctor-unavailability/${id}`, formData)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
		throw error
	}
}

export async function deleteDoctorUnavailability(id: number) {
	try {
		const { data } = await api.delete(`/doctor-unavailability/${id}`)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
		throw error
	}
}

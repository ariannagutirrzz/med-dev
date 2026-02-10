import { isAxiosError } from "axios"
import { api } from "../../../config/axios"
import type { Surgery, SurgeryFormData } from "../../../shared"

export async function createSurgery(formData: SurgeryFormData) {
	try {
		const { data } = await api.post("/surgeries", formData)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error || "Error al crear la cirugía")
		}
		throw new Error("Error al conectar con el servidor")
	}
}

export async function getSurgeries() {
	try {
		const { data } = await api.get("/surgeries")
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error || "Error al obtener las cirugías")
		}
		throw new Error("Error al conectar con el servidor")
	}
}

export async function getSurgeryById(id: number) {
	try {
		const { data } = await api.get(`/surgeries/${id}`)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error || "Error al obtener la cirugía")
		}
		throw new Error("Error al conectar con el servidor")
	}
}

export async function updateSurgeryById(
	id: number,
	formData: Partial<SurgeryFormData>,
) {
	try {
		const { data } = await api.patch(`/surgeries/${id}`, formData)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error || "Error al actualizar la cirugía")
		}
		throw new Error("Error al conectar con el servidor")
	}
}

export async function deleteSurgeryById(id: number) {
	try {
		const { data } = await api.delete(`/surgeries/${id}`)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error || "Error al eliminar la cirugía")
		}
		throw new Error("Error al conectar con el servidor")
	}
}

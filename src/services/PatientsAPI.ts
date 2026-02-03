import { isAxiosError } from "axios"
import { api } from "../config/axios"
import type { Patient, PatientFormData } from "../types"

export async function createPatient(formData: PatientFormData) {
	try {
		const { data } = await api.post("/patients", formData)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
	}
}

export async function getPatients() {
	try {
		const { data } = await api.get("/patients")
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error || "Error al obtener pacientes")
		}
		throw new Error("Error al conectar con el servidor")
	}
}

export async function updatePatientById(formData: PatientFormData) {
	try {
		const { data } = await api.patch(
			`/patients/${formData.document_id}`,
			formData,
		)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
	}
}

export async function deletePatientById(id: Patient["document_id"]) {
	try {
		const { data } = await api.delete(`/patients/${id}`)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
	}
}

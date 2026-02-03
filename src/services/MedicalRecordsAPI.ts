import { isAxiosError } from "axios"
import { api } from "../config/axios"
import type { MedicalHistory, MedicalHistoryFormData } from "../types"

export async function createMedicalRecord(formData: MedicalHistoryFormData) {
	try {
		const { data } = await api.post("/medicalRecords", formData)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
	}
}

export async function getMedicalRecord(
	patientId: MedicalHistory["patient_id"],
) {
	try {
		const { data } = await api.get(`/medicalRecords/patient/${patientId}`)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
	}
}

export async function getMedicalRecordById(id: MedicalHistory["id"]) {
	try {
		const { data } = await api.get(`/medicalRecords/${id}`)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
	}
}

export async function updateMedicalRecordById(formData: MedicalHistory) {
	try {
		const { data } = await api.patch(`/medicalRecords/${formData.id}`, formData)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
	}
}

export async function deleteMedicalRecordById(id: MedicalHistory["id"]) {
	try {
		const { data } = await api.delete(`/medicalRecords/${id}`)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
	}
}

import { api } from "../../../config/axios"
import type { MedicalHistory } from "../../../shared"

export const createMedicalRecord = async (data: FormData) => {
	const response = await api.post("/medicalRecords", data, {
		headers: { "Content-Type": "multipart/form-data" },
	})
	return response.data
}

export async function getMedicalRecord(
	patientId: MedicalHistory["patient_id"],
) {
	const { data } = await api.get(`/medicalRecords/patient/${patientId}`)
	return data
}

export async function getMedicalRecordById(id: MedicalHistory["id"]) {
	const { data } = await api.get(`/medicalRecords/${id}`)
	return data
}

export const updateMedicalRecordById = async (id: number, data: FormData) => {
	const response = await api.patch(`/medicalRecords/${id}`, data, {
		headers: { "Content-Type": "multipart/form-data" },
	})
	return response.data
}

export async function deleteMedicalRecordById(id: MedicalHistory["id"]) {
	const { data } = await api.delete(`/medicalRecords/${id}`)
	return data
}

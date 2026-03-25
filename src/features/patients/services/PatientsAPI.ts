import { api } from "../../../config/axios"
import type { Patient, PatientFormData } from "../../../shared"

export async function createPatient(formData: PatientFormData) {
	const { data } = await api.post("/patients", formData)
	return data
}

export async function getPatients(doctorId?: string) {
	const { data } = await api.get("/patients", {
		params:
			doctorId && doctorId !== "all" ? { doctor_id: doctorId } : undefined,
	})
	return data
}

export async function getDoctorPatients() {
	const { data } = await api.get("/patients/medico")
	return data
}

export async function updatePatientById(formData: PatientFormData) {
	const { data } = await api.patch(
		`/patients/${formData.document_id}`,
		formData,
	)
	return data
}

export async function deletePatientById(id: Patient["document_id"]) {
	const { data } = await api.delete(`/patients/${id}`)
	return data
}

import { api } from "../../../config/axios"

/**
 * Agrega imágenes extras a una evolución existente.
 * @param medicalRecordId Id de la evolución clínica
 * @param formData FormData que contiene campos `extra_images_files` y `title` (o títulos múltiples)
 */
export const uploadExtraImages = async (
	medicalRecordId: string | number,
	titles: string | string[],
	files: File[],
) => {
	// prepare form data following the controller expectations
	const data = new FormData()

	// titles may be single string or array, append each value even if empty
	if (Array.isArray(titles)) {
		titles.forEach((t) => {
			data.append("title", t)
		})
	} else {
		// when a single string (possibly empty) is provided
		data.append("title", titles as string)
	}

	files.forEach((f) => {
		data.append("extra_images_files", f)
	})

	const response = await api.post(
		`/medical-records-images/${medicalRecordId}`,
		data,
		{ headers: { "Content-Type": "multipart/form-data" } },
	)
	return response.data
}

/**
 * Actualiza el título o el archivo de una imagen extra existente.
 */
export const updateExtraImage = async (id: number, formData: FormData) => {
	const response = await api.patch(`/medical-records-images/${id}`, formData, {
		headers: { "Content-Type": "multipart/form-data" },
	})
	return response.data
}

/**
 * Elimina una imagen extra por su id.
 */
export const deleteExtraImage = async (id: number) => {
	const response = await api.delete(`/medical-records-images/${id}`)
	return response.data
}

/**
 * Recupera todas las imágenes asociadas a una evolución médica
 */
export const getExtraImages = async (medicalRecordId: string | number) => {
	const { data } = await api.get(
		`/medical-records-images/record/${medicalRecordId}`,
	)
	return data.images
}

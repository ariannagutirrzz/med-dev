import { isAxiosError } from "axios"
import { api } from "../config/axios"

export async function getDoctors() {
	try {
		const { data } = await api.get("/users/medicos")
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error || "Error al crear la cirugía")
		}
		throw new Error("Error al conectar con el servidor")
	}
}

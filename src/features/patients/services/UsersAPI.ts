import { api } from "../../../config/axios"

export async function getDoctors() {
	const { data } = await api.get("/users/medicos")
	return data
}

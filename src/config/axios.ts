import axios from "axios"

export const api = axios.create({
	baseURL: "http://localhost:3001/api",
	headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use((config) => {
	const token = localStorage.getItem("AUTH_TOKEN")
	config.headers.Authorization = `Bearer ${token}`
	return config
})

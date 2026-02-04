import axios from "axios"

export const api = axios.create({
	baseURL: "http://localhost:3001/api",
	headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use((config) => {
	const token = localStorage.getItem("AUTH_TOKEN")
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// Token is invalid or expired
			console.error("Unauthorized - token may be invalid or expired")
			// Optionally clear token and redirect to login
			localStorage.removeItem("AUTH_TOKEN")
			localStorage.removeItem("user")
		}
		return Promise.reject(error)
	}
)

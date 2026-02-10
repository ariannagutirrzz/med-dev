import axios from "axios"

export const api = axios.create({
	baseURL: "http://localhost:3001/api",
	headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use((config) => {
	const token = localStorage.getItem("AUTH_TOKEN")
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	} else {
		console.warn("No AUTH_TOKEN found in localStorage for request:", config.url)
	}
	return config
})

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// Token is invalid or expired
			console.error("Unauthorized - token may be invalid or expired", {
				url: error.config?.url,
				method: error.config?.method,
				hasToken: !!localStorage.getItem("AUTH_TOKEN"),
			})
			
			// Clear token and user data on 401
			localStorage.removeItem("AUTH_TOKEN")
			localStorage.removeItem("user")
			
			// Redirect to login if not already there
			if (window.location.pathname !== "/login") {
				window.location.href = "/login"
			}
		}
		return Promise.reject(error)
	}
)

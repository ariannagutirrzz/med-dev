import axios from "axios"

/** Token from either "recordar dispositivo" (localStorage) or session-only (sessionStorage). */
export function getStoredToken(): string | null {
	return localStorage.getItem("AUTH_TOKEN") || sessionStorage.getItem("AUTH_TOKEN")
}

/** User JSON from the same storage as the token. */
export function getStoredUser(): string | null {
	if (localStorage.getItem("AUTH_TOKEN")) return localStorage.getItem("user")
	return sessionStorage.getItem("user")
}

export const api = axios.create({
	baseURL: "http://localhost:3001/api",
	headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use((config) => {
	const token = getStoredToken()
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	} else {
		console.warn("No AUTH_TOKEN found for request:", config.url)
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
			})

			// Clear token and user data from both storages on 401
			localStorage.removeItem("AUTH_TOKEN")
			localStorage.removeItem("user")
			sessionStorage.removeItem("AUTH_TOKEN")
			sessionStorage.removeItem("user")

			// Redirect to login if not already there
			if (window.location.pathname !== "/login") {
				window.location.href = "/login"
			}
		}
		return Promise.reject(error)
	}
)

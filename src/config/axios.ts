import axios from "axios"
import { getApiErrorMessage } from "../shared/utils/getApiErrorMessage"

/** Token from either "recordar dispositivo" (localStorage) or session-only (sessionStorage). */
export function getStoredToken(): string | null {
	return localStorage.getItem("AUTH_TOKEN") || sessionStorage.getItem("AUTH_TOKEN")
}

/** User JSON from the same storage as the token. */
export function getStoredUser(): string | null {
	if (localStorage.getItem("AUTH_TOKEN")) return localStorage.getItem("user")
	return sessionStorage.getItem("user")
}

/** API base URL: same-origin /api in production, localhost in dev. Override with VITE_API_URL. */
export function getApiBase(): string {
	return (
		import.meta.env.VITE_API_URL ??
		(import.meta.env.PROD ? "/api" : "http://localhost:3001/api")
	)
}

export const api = axios.create({
	baseURL: getApiBase(),
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
			return Promise.reject(
				new Error(
					getApiErrorMessage(
						error,
						"Sesión expirada o no autorizado. Inicia sesión de nuevo.",
					),
				),
			)
		}

		// Un solo `Error` con mensaje listo para toast.error(err.message) / getApiErrorMessage redundante
		return Promise.reject(new Error(getApiErrorMessage(error)))
	}
)

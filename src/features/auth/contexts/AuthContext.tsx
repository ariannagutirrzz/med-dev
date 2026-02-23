import type { ReactNode } from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { api } from "../../../config/axios"

export interface User {
	name: string
	email: string
	role?: string
	document_id?: string
	image: string
}

interface AuthContextType {
	user: User | null
	isAuthenticated: boolean
	login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
	logout: () => void
	loading: boolean
	refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	// Check for existing session on mount (localStorage = "recordar dispositivo", sessionStorage = no)
	useEffect(() => {
		const tokenFromLocal = localStorage.getItem("AUTH_TOKEN")
		const tokenFromSession = sessionStorage.getItem("AUTH_TOKEN")
		const storedToken = tokenFromLocal || tokenFromSession
		const storedUser = tokenFromLocal
			? localStorage.getItem("user")
			: sessionStorage.getItem("user")

		if (storedUser && storedToken) {
			setUser(JSON.parse(storedUser))
		} else {
			if (storedUser && !storedToken) {
				localStorage.removeItem("user")
				sessionStorage.removeItem("user")
			}
		}
		setLoading(false)
	}, [])

	const refreshUser = async () => {
		const response = await api.get("/users/me")
		if (response.data?.user) {
			const updated = { ...response.data.user }
			setUser(updated)
			// Persist to same storage as current session
			if (localStorage.getItem("AUTH_TOKEN")) {
				localStorage.setItem("user", JSON.stringify(updated))
			} else if (sessionStorage.getItem("AUTH_TOKEN")) {
				sessionStorage.setItem("user", JSON.stringify(updated))
			}
		}
	}

	const login = async (
		email: string,
		password: string,
		rememberMe: boolean = true,
	) => {
		const response = await fetch("http://localhost:3001/api/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
		})

		if (!response.ok) {
			const error = await response.json()
			throw new Error(error.error || "Login failed")
		}

		const data = await response.json()
		const userData: User = {
			name: data.user?.name || email.split("@")[0],
			email: data.user?.email || email,
			role: data.user?.role || "Paciente",
			document_id: data.user?.document_id,
			image: data.user?.image,
		}
		setUser(userData)

		if (rememberMe) {
			localStorage.setItem("AUTH_TOKEN", data.token)
			localStorage.setItem("user", JSON.stringify(userData))
			sessionStorage.removeItem("AUTH_TOKEN")
			sessionStorage.removeItem("user")
		} else {
			sessionStorage.setItem("AUTH_TOKEN", data.token)
			sessionStorage.setItem("user", JSON.stringify(userData))
			localStorage.removeItem("AUTH_TOKEN")
			localStorage.removeItem("user")
		}
	}

	const logout = () => {
		setUser(null)
		localStorage.removeItem("user")
		localStorage.removeItem("AUTH_TOKEN")
		sessionStorage.removeItem("user")
		sessionStorage.removeItem("AUTH_TOKEN")
		localStorage.removeItem("chat_history")
	}

	return (
		<AuthContext.Provider
			value={{
				user,
				isAuthenticated: !!user,
				login,
				logout,
				loading,
				refreshUser,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider")
	}
	return context
}

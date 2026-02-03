import type { ReactNode } from "react"
import { createContext, useContext, useEffect, useState } from "react"

export interface User {
	name: string
	email: string
	role?: string
}

interface AuthContextType {
	user: User | null
	isAuthenticated: boolean
	login: (email: string, password: string) => Promise<void>
	logout: () => void
	loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	// Check for existing session on mount
	useEffect(() => {
		const storedUser = localStorage.getItem("user")
		const storedToken = localStorage.getItem("AUTH_TOKEN")
		
		// Only set user if both user data and token exist
		if (storedUser && storedToken) {
			setUser(JSON.parse(storedUser))
		} else {
			// Clear invalid session
			if (storedUser && !storedToken) {
				localStorage.removeItem("user")
			}
		}
		setLoading(false)
	}, [])

	const login = async (email: string, password: string) => {
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
		}
		setUser(userData)
		localStorage.setItem("AUTH_TOKEN", data.token)
		localStorage.setItem("user", JSON.stringify(userData))
	}

	const logout = () => {
		setUser(null)
		localStorage.removeItem("user")
		localStorage.removeItem("AUTH_TOKEN")
	}

	return (
		<AuthContext.Provider
			value={{
				user,
				isAuthenticated: !!user,
				login,
				logout,
				loading,
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

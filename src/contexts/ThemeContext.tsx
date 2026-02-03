import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
	theme: Theme
	setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
	const [theme, setThemeState] = useState<Theme>(() => {
		// Get theme from localStorage or default to light
		const stored = localStorage.getItem("theme") as Theme | null
		return stored || "light"
	})

	useEffect(() => {
		// Apply theme to document
		const root = document.documentElement
		if (theme === "dark") {
			root.classList.add("dark")
		} else {
			root.classList.remove("dark")
		}
		// Save to localStorage
		localStorage.setItem("theme", theme)
	}, [theme])

	const setTheme = (newTheme: Theme) => {
		setThemeState(newTheme)
	}

	return (
		<ThemeContext.Provider value={{ theme, setTheme }}>
			{children}
		</ThemeContext.Provider>
	)
}

export const useTheme = () => {
	const context = useContext(ThemeContext)
	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider")
	}
	return context
}

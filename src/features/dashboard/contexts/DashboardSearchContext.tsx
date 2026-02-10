import type { ReactNode } from "react"
import { createContext, useContext, useState } from "react"

interface DashboardSearchContextType {
	searchTerm: string
	setSearchTerm: (term: string) => void
	clearSearch: () => void
}

const DashboardSearchContext = createContext<
	DashboardSearchContextType | undefined
>(undefined)

export const DashboardSearchProvider = ({
	children,
}: {
	children: ReactNode
}) => {
	const [searchTerm, setSearchTerm] = useState("")

	const clearSearch = () => {
		setSearchTerm("")
	}

	return (
		<DashboardSearchContext.Provider
			value={{ searchTerm, setSearchTerm, clearSearch }}
		>
			{children}
		</DashboardSearchContext.Provider>
	)
}

export const useDashboardSearch = () => {
	const context = useContext(DashboardSearchContext)
	if (context === undefined) {
		throw new Error(
			"useDashboardSearch must be used within a DashboardSearchProvider",
		)
	}
	return context
}

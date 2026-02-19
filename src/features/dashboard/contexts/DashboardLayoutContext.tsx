import type { ReactNode } from "react"
import { createContext, useContext } from "react"

interface DashboardLayoutContextType {
	isMobile: boolean
	onToggleSidebar: () => void
}

const DashboardLayoutContext = createContext<
	DashboardLayoutContextType | undefined
>(undefined)

export const DashboardLayoutProvider = ({
	children,
	value,
}: {
	children: ReactNode
	value: DashboardLayoutContextType
}) => {
	return (
		<DashboardLayoutContext.Provider value={value}>
			{children}
		</DashboardLayoutContext.Provider>
	)
}

export const useDashboardLayout = () => {
	const context = useContext(DashboardLayoutContext)
	if (context === undefined) {
		throw new Error(
			"useDashboardLayout must be used within a DashboardLayoutProvider",
		)
	}
	return context
}

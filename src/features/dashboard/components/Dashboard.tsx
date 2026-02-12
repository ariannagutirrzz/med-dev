import type { ReactNode } from "react"
import { Sidebar } from "../../../shared"

interface MenuItem {
	id: string
	label: string
	icon?: React.ReactNode
}

interface DashboardProps {
	user: {
		name: string
		role: string
		profilePicture?: string
	}
	menuItems: MenuItem[]
	children: ReactNode
	isSidebarOpen: boolean
	activeMenuItem?: string
	onMenuItemClick: (itemId: string) => void
	onToggleSidebar: () => void
	onLogout?: () => void
}

const Dashboard: React.FC<DashboardProps> = ({
	user,
	menuItems,
	children,
	isSidebarOpen,
	activeMenuItem,
	onMenuItemClick,
	onToggleSidebar,
	onLogout,
}) => {
	return (
		<div className="flex h-screen bg-gray-100">
			<Sidebar
				user={user}
				menuItems={menuItems}
				isSidebarOpen={isSidebarOpen}
				activeMenuItem={activeMenuItem}
				onMenuItemClick={onMenuItemClick}
				onToggleSidebar={onToggleSidebar}
				onLogout={onLogout}
			/>

			{/* Contenido principal */}
			<main className="flex-1 overflow-auto">{children}</main>
		</div>
	)
}

export default Dashboard

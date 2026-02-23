import type { ReactNode } from "react"
import { HiOutlineBars3 } from "react-icons/hi2"
import { useLocation } from "react-router-dom"
import { Button, Sidebar } from "../../../shared"
import { DashboardLayoutProvider } from "../contexts/DashboardLayoutContext"
import { useIsMobile } from "../hooks/useIsMobile"

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
	const isMobile = useIsMobile()
	const location = useLocation()

	const handleMenuItemClick = (itemId: string) => {
		onMenuItemClick(itemId)
		if (isMobile) onToggleSidebar()
	}

	const handleLogout = () => {
		onLogout?.()
		if (isMobile) onToggleSidebar()
	}

	return (
		<div className="flex h-screen bg-gray-100">
			{/* Backdrop móvil: tap fuera cierra el menú (solo cuando sidebar abierto en viewport móvil) */}
			{isMobile && isSidebarOpen && (
				<button
					type="button"
					aria-label="Cerrar menú"
					onClick={onToggleSidebar}
					className="fixed inset-0 z-30 bg-black/50 md:hidden"
				/>
			)}

			{/* Sidebar: en móvil oculto por defecto; en desktop siempre visible. data-sidebar-closed + CSS global fuerza oculto en <768px. */}
			<div
				data-dashboard-sidebar
				data-sidebar-closed={!isSidebarOpen ? "" : undefined}
				className={`
					fixed left-0 top-0 bottom-0 z-40 h-screen w-56 max-w-[75vw] transition-transform duration-300 ease-in-out
					${isSidebarOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"}
					md:relative md:inset-auto md:top-auto md:bottom-auto md:h-full md:min-h-0 md:translate-x-0 md:w-auto md:max-w-none
				`}
			>
				<Sidebar
					user={user}
					menuItems={menuItems}
					isSidebarOpen={isMobile ? true : isSidebarOpen}
					activeMenuItem={activeMenuItem}
					onMenuItemClick={handleMenuItemClick}
					onToggleSidebar={onToggleSidebar}
					onLogout={onLogout ? handleLogout : undefined}
				/>
			</div>

			{/* Contenido principal; menú móvil va en el header (home) o en barra superior (resto) */}
			<main className="flex-1 overflow-auto relative min-w-0 flex flex-col">
				<DashboardLayoutProvider
					value={{ isMobile, onToggleSidebar }}
				>
					{/* En páginas que no son home, barra con solo hamburger para abrir menú */}
					{isMobile && location.pathname !== "/dashboard/home" && (
						<div className="flex items-center shrink-0 h-10 px-3 border-b border-gray-200 bg-white/95">
							<Button
								type="button"
								variant="text"
								onClick={onToggleSidebar}
								aria-label="Abrir menú"
								className="!w-8 !h-8 !min-w-0 !p-0 flex items-center justify-center !text-gray-600 hover:!bg-gray-100 !rounded-md"
							>
								<HiOutlineBars3 className="w-5 h-5 text-gray-600" />
							</Button>
						</div>
					)}
					{children}
				</DashboardLayoutProvider>
			</main>
		</div>
	)
}

export default Dashboard

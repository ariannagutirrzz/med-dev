import { FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { TbLogout2 } from "react-icons/tb"

interface MenuItem {
	id: string
	label: string
	icon?: React.ReactNode
}

interface SidebarProps {
	user: {
		name: string
		role: string
		image?: string
	}
	menuItems: MenuItem[]
	isSidebarOpen: boolean
	activeMenuItem?: string
	onMenuItemClick: (itemId: string) => void
	onToggleSidebar: () => void
	onLogout?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({
	user,
	menuItems,
	isSidebarOpen,
	activeMenuItem,
	onMenuItemClick,
	onToggleSidebar,
	onLogout,
}) => {
	return (
		<aside
			className={`
        flex flex-col h-full min-h-0
        bg-white
        text-white
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "w-64 sm:w-72" : "w-16 sm:w-20"}
        relative
        shadow-xl
      `}
		>
			{/* --- BOTÓN DE TOGGLE AÑADIDO --- */}
			<button
				type="button"
				onClick={onToggleSidebar}
				className="absolute -right-3 top-10 bg-white border border-gray-200 rounded-full w-6 h-6 flex items-center justify-center hover:text-primary shadow-sm cursor-pointer z-50 text-gray-600"
				style={{ color: "#4b5563" }}
				aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
			>
				{isSidebarOpen ? (
					<FaChevronLeft className="w-3 h-3 shrink-0" style={{ color: "inherit" }} aria-hidden />
				) : (
					<FaChevronRight className="w-3 h-3 shrink-0" style={{ color: "inherit" }} aria-hidden />
				)}
			</button>
			{/* ------------------------------ */}
			{/* Header del usuario */}
			<div className="shrink-0 p-3 sm:p-4 md:p-5 border-b border-gray-200 flex-col text-center items-center gap-2 sm:gap-4 relative">
				{/* Foto de perfil */}
				<div className="shrink-0 justify-center flex mb-2 sm:mb-3 md:mb-4">
					{user.image ? (
						<img
							src={user.image || undefined}
							alt={`${user.name} profile`}
							className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-bg-primary"
						/>
					) : (
						<div
							className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm sm:text-base md:text-lg`}
						>
							{user.name.charAt(0).toUpperCase()}
						</div>
					)}
				</div>

				{/* Información del usuario */}
				<div className={`flex-1 min-w-0 ${isSidebarOpen ? "block" : "hidden"}`}>
					<h3 className="text-sm sm:text-base text-black font-semibold truncate">
						{user.name}
					</h3>
					<p className="text-xs sm:text-sm text-gray-400 truncate">
						{user.role}
					</p>
				</div>
			</div>

			{/* Menú de opciones: scroll interno para no desplazar toda la página */}
			<nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-2 sm:p-3 md:p-4">
				<ul className="space-y-1 sm:space-y-2">
					{menuItems.map((item) => {
						const isActive = activeMenuItem === item.id
						return (
							<li key={item.id}>
								<button
									type="button"
									className={`
                    w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 md:py-3 rounded-lg
                    transition-all duration-200 ease-in-out cursor-pointer
                    border-0 bg-transparent
                    ${
											isActive
												? "bg-primary! text-white! shadow-lg" // Estilo cuando está activo
												: "text-gray-600! hover:translate-x-1 hover:bg-gray-100! hover:text-primary!" // Estilo normal + hover solo cuando NO está activo
										}
                    ${isSidebarOpen ? "justify-start" : "justify-center"}
                  `}
									style={{
										color: isActive ? undefined : "#4b5563", // gray-600
									}}
									onClick={() => onMenuItemClick(item.id)}
									title={!isSidebarOpen ? item.label : undefined}
								>
									{/* Icono */}
									{item.icon && (
										<span
											className={`shrink-0 text-base sm:text-lg ${isActive ? "text-white" : "text-gray-600"}`}
										>
											{item.icon}
										</span>
									)}

									{/* Label */}
									<span
										className={`
                    font-medium text-sm sm:text-base
                    ${isSidebarOpen ? "block" : "hidden"}
                  `}
									>
										{item.label}
									</span>
								</button>
							</li>
						)
					})}
				</ul>
			</nav>

			{/* Logout button */}
			{onLogout && (
				<div className="shrink-0 p-2 sm:p-3 md:p-4 border-t border-gray-200 bg-white">
					<button
						type="button"
						onClick={onLogout}
						className={`
							w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 md:py-3 rounded-lg
							transition-all duration-200 ease-in-out cursor-pointer
							border-0 bg-transparent
							text-red-500! hover:bg-red-50! hover:text-red-700!
							${isSidebarOpen ? "justify-start" : "justify-center"}
						`}
						style={{
							color: "#ef4444", // red-500
						}}
						title={!isSidebarOpen ? "Cerrar sesión" : undefined}
					>
						<TbLogout2 className="text-base sm:text-lg" />
						<span
							className={`font-medium text-sm sm:text-base ${isSidebarOpen ? "block" : "hidden"}`}
						>
							Cerrar sesión
						</span>
					</button>
				</div>
			)}
		</aside>
	)
}

export default Sidebar

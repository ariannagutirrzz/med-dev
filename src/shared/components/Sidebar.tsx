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
		profilePicture?: string
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
        flex flex-col
        bg-white
        text-white
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "w-80" : "w-25"}
        relative
        shadow-xl
      `}
		>
			{/* --- BOTÓN DE TOGGLE AÑADIDO --- */}
			<button
				type="button"
				onClick={onToggleSidebar}
				className="absolute -right-3 top-10 bg-white border border-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-gray-500 hover:text-primary shadow-sm cursor-pointer z-50"
			>
				{isSidebarOpen ? "❮" : "❯"}
			</button>
			{/* ------------------------------ */}
			{/* Header del usuario */}
			<div className="p-5 border-b border-gray-700 flex-col text-center items-center gap-4 relative">
				{/* Foto de perfil */}
				<div className="shrink-0 justify-center flex mb-4">
					{user.profilePicture ? (
						<img
							src={user.profilePicture}
							alt={`${user.name} profile`}
							className="w-18 h-18 rounded-full object-cover border-2 border-bg-primary"
						/>
					) : (
						<div
							className={`w-18 h-18 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg `}
						>
							{user.name.charAt(0).toUpperCase()}
						</div>
					)}
				</div>

				{/* Información del usuario */}
				<div className={`flex-1 min-w-0 ${isSidebarOpen ? "block" : "hidden"}`}>
					<h3 className="text-base text-black font-semibold truncate">
						{user.name}
					</h3>
					<p className="text-sm text-gray-400 truncate">{user.role}</p>
				</div>
			</div>

			{/* Menú de opciones */}
			<nav className="flex-1 p-4">
				<ul className="space-y-2">
					{menuItems.map((item) => {
						const isActive = activeMenuItem === item.id
						return (
							<li key={item.id}>
								<button
									type="button"
									className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-lg
                    transition-all duration-200 ease-in-out cursor-pointer
                    ${
											isActive
												? "bg-primary text-white shadow-lg" // Estilo cuando está activo
												: "text-gray-300 hover:translate-x-1 hover:bg-primary-dark hover:text-white" // Estilo normal + hover solo cuando NO está activo
										}
                    ${isSidebarOpen ? "justify-start" : "justify-center"}
                  `}
									onClick={() => onMenuItemClick(item.id)}
									title={!isSidebarOpen ? item.label : undefined}
								>
									{/* Icono */}
									{item.icon && (
										<span className="shrink-0 text-lg">{item.icon}</span>
									)}

									{/* Label */}
									<span
										className={`
                    font-medium
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
				<div className="p-4 border-t border-gray-700">
					<button
						type="button"
						onClick={onLogout}
						className={`
							w-full flex items-center gap-3 px-3 py-3 rounded-lg
							transition-all duration-200 ease-in-out cursor-pointer
							text-red-500 hover:bg-red-50 hover:text-red-700
							${isSidebarOpen ? "justify-start" : "justify-center"}
						`}
						title={!isSidebarOpen ? "Cerrar sesión" : undefined}
					>
						<TbLogout2 />
						<span
							className={`font-medium ${isSidebarOpen ? "block" : "hidden"}`}
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

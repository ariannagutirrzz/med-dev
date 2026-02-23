import { CiCalendar } from "react-icons/ci"
import { HiOutlineBars3, HiOutlineMagnifyingGlass } from "react-icons/hi2"
import { useAuth } from "../../auth"
import { useDashboardLayout } from "../contexts/DashboardLayoutContext"
import { useDashboardSearch } from "../contexts/DashboardSearchContext"
import { NotificationBell } from "../../notifications"

export default function DashboardHeader() {
	const { user } = useAuth()
	const { searchTerm, setSearchTerm } = useDashboardSearch()
	const { isMobile, onToggleSidebar } = useDashboardLayout()
	const isPatient = user?.role === "Paciente"

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value)
	}

	const now = new Date()
	const weekday = now.toLocaleDateString("es-ES", { weekday: "long" })
	const dateFormatted = now.toLocaleDateString("es-ES", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	})

	return (
		<div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
			{/* Mobile: menú + fecha + campana. Desktop: solo fecha a la izquierda */}
			<div className="flex flex-row items-center justify-between md:justify-start gap-2 min-w-0 shrink-0">
				{isMobile && (
					<button
						type="button"
						onClick={onToggleSidebar}
						aria-label="Abrir menú"
						className="flex items-center justify-center w-8 h-8 rounded-md text-gray-600 hover:bg-gray-100 shrink-0"
					>
						<HiOutlineBars3 className="w-5 h-5" />
					</button>
				)}
				<h2 className="text-sm sm:text-base lg:text-lg text-gray-400 font-semibold flex flex-row items-center gap-1 sm:gap-2 capitalize">
					<CiCalendar className="text-primary font-semibold text-base sm:text-lg shrink-0" />
					<span className="hidden xs:inline">{weekday}</span>
					<span className="xs:hidden">{weekday.slice(0, 3)}</span>
					<b className="text-primary font-semibold">{dateFormatted}</b>
				</h2>
				{/* Solo en móvil: campana al lado de la fecha */}
				<div className="flex items-center shrink-0 md:hidden">
					<NotificationBell />
				</div>
			</div>

			{/* Barra de búsqueda (oculta para Paciente) */}
			{!isPatient && (
			<div className="relative flex-1 w-full md:max-w-md min-w-0">
				<div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
					<HiOutlineMagnifyingGlass className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
				</div>
				<input
					type="text"
					className="block w-full pl-8 sm:pl-10 pr-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
					placeholder="Buscar pacientes, citas..."
					value={searchTerm}
					onChange={handleSearchChange}
				/>
			</div>
			)}

			{/* Desktop: campana a la derecha de la pantalla */}
			<div className="hidden md:flex items-center shrink-0">
				<NotificationBell />
			</div>
		</div>
	)
}

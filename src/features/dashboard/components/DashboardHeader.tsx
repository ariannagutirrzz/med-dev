import { CiCalendar } from "react-icons/ci"
import { HiOutlineMagnifyingGlass } from "react-icons/hi2"
import { useDashboardSearch } from "../contexts/DashboardSearchContext"
import { NotificationBell } from "../../notifications"

export default function DashboardHeader() {
	const { searchTerm, setSearchTerm } = useDashboardSearch()

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
		<div className="mb-4 justify-between flex items-center">
			<h2 className="text-lg text-gray-400 font-semibold flex flex-row items-center gap-2 capitalize">
				<CiCalendar className="text-primary font-semibold" />
				{weekday} <b className="text-primary font-semibold">{dateFormatted}</b>
			</h2>

			{/* Barra de búsqueda */}
			<div className="relative flex-1 max-w-md mx-4">
				<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
					<HiOutlineMagnifyingGlass className="h-5 w-5 text-gray-400" />
				</div>
				<input
					type="text"
					className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
					placeholder="Buscar pacientes, citas..."
					value={searchTerm}
					onChange={handleSearchChange}
				/>
			</div>

		
			<NotificationBell />
		</div>
	)
}

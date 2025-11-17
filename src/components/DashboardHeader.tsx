import { useState } from "react"
import { CiCalendar } from "react-icons/ci"
import { HiOutlineBellAlert, HiOutlineMagnifyingGlass } from "react-icons/hi2"

export default function DashboardHeader() {
	const [searchTerm, setSearchTerm] = useState("")
	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value)
	}

	return (
		<div className="mb-4 justify-between flex items-center">
			<h2 className="text-lg text-gray-400 font-semibold flex flex-row items-center gap-2">
				<CiCalendar className="text-primary font-semibold" />
				Miercoles <b className="text-primary font-semibold">24/11/2025</b>
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

			<h2 className="text-lg text-gray-400 font-semibold">
				Valor Dolar: <b className="text-primary font-semibold">3019.91 Bs</b>
			</h2>
			<HiOutlineBellAlert className="w-8 h-8 cursor-pointer text-gray-400" />
		</div>
	)
}

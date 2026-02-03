import { FaFilter, FaSearch } from "react-icons/fa"

type InventoryHeaderProps = {
	setSearchTerm: React.Dispatch<React.SetStateAction<string>>
	setCategoryFilter: React.Dispatch<React.SetStateAction<string>>
	categoryFilter: string
}

const InventoryHeader = ({
	setSearchTerm,
	setCategoryFilter,
	categoryFilter,
}: InventoryHeaderProps) => {
	return (
		<div className="w-full bg-white p-1 rounded-2xl border border-gray-200 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
			<div className="flex flex-row items-center">
				{/* Contenedor del Input (Ocupa todo el espacio disponible) */}
				<div className="relative flex-1 flex items-center">
					<FaSearch className="absolute left-4 text-gray-400" size={16} />
					<input
						type="text"
						placeholder="Buscar por nombre o código..."
						className="w-full pl-12 pr-4 py-3 bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>

				{/* Línea divisoria sutil */}
				<div className="h-8 w-px bg-gray-200 mx-2"></div>

				{/* Filtro de Categoría */}
				<div className="relative flex items-center pr-2">
					<FaFilter
						className="absolute left-3 text-gray-400 pointer-events-none"
						size={12}
					/>
					<select
						value={categoryFilter}
						onChange={(e) => setCategoryFilter(e.target.value)}
						className="pl-9 pr-8 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-medium rounded-xl appearance-none outline-none cursor-pointer transition-colors border border-transparent"
					>
						<option value="all">Todas las Categorías</option>
						<option value="Descartable">Descartable</option>
						<option value="No Descartable">No descartable</option>
					</select>
					{/* Flecha personalizada para el select */}
					<div className="absolute right-5 pointer-events-none w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-[5px] border-t-gray-400"></div>
				</div>
			</div>
		</div>
	)
}

export default InventoryHeader

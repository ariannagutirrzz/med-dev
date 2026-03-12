import { ConfigProvider, Input, Select } from "antd"
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
		<ConfigProvider
			theme={{
				token: {
					borderRadius: 12,
				},
				components: {
					Input: {
						activeBorderColor: "#35524a",
						hoverBorderColor: "#35524a",
					},
				},
			}}
		>
			<div className="w-full bg-white p-1 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center transition-all focus-within:ring-2 focus-within:ring-lime-600/20 gap-2 md:gap-0">
				{/* Buscador de Ant Design */}
				<Input
					placeholder="Buscar por nombre o código..."
					variant="borderless"
					prefix={<FaSearch className="text-gray-400 mr-2" size={16} />}
					className="flex-1 py-3 text-gray-700 placeholder:text-gray-400"
					onChange={(e) => setSearchTerm(e.target.value)}
					allowClear // Permite borrar la búsqueda con una "X"
				/>

				{/* Línea divisoria sutil (solo en escritorio) */}
				<div className="hidden md:block h-8 w-px bg-gray-200 mx-2"></div>

				{/* Filtro de Categoría */}
				<div className="flex items-center pr-2 md:pr-2 min-w-0 w-full md:w-[210px]">
					<Select
						id="category_filter"
						value={categoryFilter}
						onChange={(value) => setCategoryFilter(value)}
						variant="borderless"
						className="w-full h-10 flex items-center bg-gray-100! hover:bg-gray-100 rounded-xl transition-colors font-medium text-sm"
						prefix={<FaFilter className="text-gray-400 mr-1" size={12} />}
						options={[
							{ value: "all", label: "Todas las Categorías" },
							{ value: "Descartable", label: "Descartable" },
							{ value: "No Descartable", label: "No Descartable" },
						]}
					/>
				</div>
			</div>
		</ConfigProvider>
	)
}

export default InventoryHeader

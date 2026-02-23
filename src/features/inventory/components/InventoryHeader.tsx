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
						activeBorderColor: "#789a61",
						hoverBorderColor: "#789a61",
					},
				},
			}}
		>
			<div className="w-full bg-white p-1 rounded-2xl border border-gray-200 shadow-sm flex flex-row items-center transition-all focus-within:ring-2 focus-within:ring-lime-600/20">
				{/* Buscador de Ant Design */}
				<Input
					placeholder="Buscar por nombre o código..."
					variant="borderless"
					prefix={<FaSearch className="text-gray-400 mr-2" size={16} />}
					className="flex-1 py-3 text-gray-700 placeholder:text-gray-400"
					onChange={(e) => setSearchTerm(e.target.value)}
					allowClear // Permite borrar la búsqueda con una "X"
				/>

				{/* Línea divisoria sutil */}
				<div className="h-8 w-px bg-gray-200 mx-2"></div>

				{/* Filtro de Categoría */}
				<div className="flex items-center pr-2 min-w-[210px]">
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

import { useState } from "react"
// Importamos de react-icons (Fa = Font Awesome, Md = Material Design)
import { FaBoxOpen } from "react-icons/fa"
import type { Supply } from "../../types"
import InventoryHeader from "./InventoryHeader"
import InventoryRow from "./InventoryRow"

const Inventory = () => {
	const [supplies, setSupplies] = useState<Supply[]>([])
	const [searchTerm, setSearchTerm] = useState("")
	const [categoryFilter, setCategoryFilter] = useState("all")

	const filteredSupplies = supplies.filter(
		(item) =>
			item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.id.includes(searchTerm),
	)

	return (
		<div className="p-4 space-y-6">
			{/* Header del Inventario */}
			<div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col">
				<div className="flex-1 flex items-center justify-center">
					<InventoryHeader
						setSearchTerm={setSearchTerm}
						setCategoryFilter={setCategoryFilter}
						categoryFilter={categoryFilter}
					/>
				</div>
			</div>

			{/* Tabla de Resultados */}
			<div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-left">
						<thead className="bg-gray-50 border-b border-gray-100">
							<tr>
								<th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
									Insumo
								</th>
								<th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
									Categoría
								</th>
								<th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
									Stock
								</th>
								<th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
									Estado
								</th>
								<th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
									Acciones
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-50">
							{filteredSupplies.length > 0 ? (
								filteredSupplies.map((item) => (
									<InventoryRow key={item.id} item={item} />
								))
							) : (
								<tr>
									<td
										colSpan={5}
										className="px-6 py-10 text-center text-gray-400"
									>
										<FaBoxOpen className="mx-auto mb-2 opacity-20" size={48} />
										<p>No se encontraron insumos médicos.</p>
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}

export default Inventory

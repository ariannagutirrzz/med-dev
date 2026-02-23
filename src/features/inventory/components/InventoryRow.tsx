import { FaEdit, FaExclamationTriangle, FaTrashAlt } from "react-icons/fa"
import { MdOutlineMedicalServices } from "react-icons/md"
import type { Supply } from "../../../shared"

const InventoryRow = ({
	item,
	onDelete,
	onEdit,
}: {
	item: Supply
	onDelete: (id: Supply["id"]) => void
	onEdit: () => void
}) => {
	return (
		<tr className="hover:bg-blue-50/30 transition-colors group">
			<td className="px-6 py-4">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
						<MdOutlineMedicalServices size={20} />
					</div>
					<div className="flex flex-col">
						<span className="font-semibold text-gray-800">{item.name}</span>
						<span className="text-xs text-gray-400 font-mono">
							ID: {item.id}
						</span>
					</div>
				</div>
			</td>
			<td className="px-6 py-4 text-sm text-gray-600">
				<span className="bg-gray-100 px-2.5 py-1 rounded-md text-xs font-medium">
					{item.category}
				</span>
			</td>
			<td className="px-6 py-4">
				<div className="flex items-center gap-1.5">
					<span
						className={`font-bold ${item.status === "low stock" ? "text-red-600" : "text-gray-700"}`}
					>
						{item.quantity}
					</span>
					<span className="text-gray-400 text-xs">{item.unit}</span>
				</div>
			</td>
			<td className="px-6 py-4">
				{item.status === "out of stock" ? (
					<span className="flex items-center gap-1.5 text-red-700 bg-red-100 px-2.5 py-1 rounded-full text-[10px] font-black uppercase w-fit">
						<FaExclamationTriangle size={10} /> Agotado
					</span>
				) : item.status === "low stock" ? (
					<span className="text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">
						Stock Bajo
					</span>
				) : (
					<span className="text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full text-[10px] font-black uppercase">
						Disponible
					</span>
				)}
			</td>
			<td className="px-6 py-4 text-right">
				<div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
					<button
						type="button"
						onClick={onEdit}
						className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all cursor-pointer"
						title="Editar"
					>
						<FaEdit size={16} />
					</button>
					<button
						type="button"
						onClick={() => onDelete(item.id)}
						className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-all cursor-pointer"
						title="Eliminar"
					>
						<FaTrashAlt size={14} />
					</button>
				</div>
			</td>
		</tr>
	)
}

export default InventoryRow

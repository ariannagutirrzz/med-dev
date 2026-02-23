import { useCallback, useEffect, useState } from "react"
import { FaBoxOpen } from "react-icons/fa"
import { toast } from "react-toastify"
import { deleteSupplyById, getSupplies } from "../services/SuppliesAPI"
import type { Supply } from "../../../shared"
import { ConfirmModal } from "../../../shared"
import CreateSupplyModal from "./CreateSupplyModal" // Asegúrate de importarlo
import InventoryHeader from "./InventoryHeader"
import InventoryRow from "./InventoryRow"
import { Pagination } from "antd"

const Inventory = () => {
	const [supplies, setSupplies] = useState<Supply[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [searchTerm, setSearchTerm] = useState("")
	const [categoryFilter, setCategoryFilter] = useState("all")
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
	const [supplyToDelete, setSupplyToDelete] = useState<Supply["id"] | null>(
		null,
	)
	const [supplyToEdit, setSupplyToEdit] = useState<Supply | null>(null)
	// Estados de paginación
const [currentPage, setCurrentPage] = useState(1);
const pageSize = 10;

// Resetear página al filtrar (Busqueda o Categoría)
useEffect(() => {
    setCurrentPage(1);
}, [searchTerm, categoryFilter]);

	const openEditModal = (supply: Supply) => {
		setSupplyToEdit(supply)
		setIsModalOpen(true)
	}

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setSupplyToEdit(null) // Limpiar selección al cerrar
	}

	const fetchSupplies = useCallback(async () => {
		try {
			setIsLoading(true)
			const data = await getSupplies()
			setSupplies(data.supplies)
		} catch (error) {
			console.log(error)
			toast.error("Error al obtener el inventario")
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchSupplies()
	}, [fetchSupplies])

	// Modificamos el handleDelete original para que solo abra el modal
	const openDeleteConfirm = (id: Supply["id"]) => {
		setSupplyToDelete(id)
		setIsConfirmModalOpen(true)
	}

	const handleConfirmDelete = async () => {
		if (!supplyToDelete) return

		try {
			await deleteSupplyById(supplyToDelete)
			toast.success("Insumo eliminado con éxito")
			await fetchSupplies() // Recargar la lista
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Error al eliminar")
		} finally {
			setIsConfirmModalOpen(false)
			setSupplyToDelete(null)
		}
	}

	const filteredSupplies = supplies.filter((item) => {
		const matchesSearch =
			item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.id.toLowerCase().includes(searchTerm.toLowerCase())
		const matchesCategory =
			categoryFilter === "all" || item.category === categoryFilter

		return matchesSearch && matchesCategory
	})

	const indexOfLastItem = currentPage * pageSize;
const indexOfFirstItem = indexOfLastItem - pageSize;

// Esta es la lista que usaremos para el .map()
const currentItems = filteredSupplies.slice(indexOfFirstItem, indexOfLastItem);

	return (
		<div className="p-6 space-y-6">
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-gray-800">Inventario</h1>
				<p className="text-gray-600 mt-2">
					Gestiona y manten un control de los insumos de la unidad
				</p>
			</div>
			<div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row gap-4 items-center">
				<InventoryHeader
					setSearchTerm={setSearchTerm}
					setCategoryFilter={setCategoryFilter}
					categoryFilter={categoryFilter}
				/>
				<button
					type="button"
					onClick={() => setIsModalOpen(true)}
					className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md whitespace-nowrap cursor-pointer"
				>
					+ Nuevo Insumo
				</button>
			</div>

			<div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					{isLoading ? (
						<div className="p-20 text-center text-gray-400 font-bold animate-pulse">
							CARGANDO INVENTARIO...
						</div>
					) : (
						<table className="w-full text-left">
							<thead className="bg-gray-50 border-b border-gray-100">
								<tr>
									<th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
										Insumo
									</th>
									<th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
										Categoría
									</th>
									<th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
										Stock
									</th>
									<th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
										Estado
									</th>
									<th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">
										Acciones
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-50">
								{currentItems.length > 0 ? (
									currentItems.map((item) => (
										<InventoryRow
											key={item.id}
											item={item}
											onDelete={openDeleteConfirm}
											onEdit={() => openEditModal(item)}
										/>
									))
								) : (
									<tr>
										<td
											colSpan={5}
											className="px-6 py-10 text-center text-gray-400"
										>
											<FaBoxOpen
												className="mx-auto mb-2 opacity-20"
												size={48}
											/>
											<p>No se encontraron insumos médicos.</p>
										</td>
									</tr>
								)}
							</tbody>
						</table>
					)}
				</div>
				<div className="p-4 border-t border-gray-100 flex justify-center bg-gray-50/50">
                <Pagination
                    current={currentPage}
                    total={filteredSupplies.length}
                    pageSize={pageSize}
                    onChange={(page) => setCurrentPage(page)}
                    showSizeChanger={false}
                    size="small"
                />
            </div>
			</div>

			<ConfirmModal
				isOpen={isConfirmModalOpen}
				onClose={() => setIsConfirmModalOpen(false)}
				onConfirm={handleConfirmDelete}
				title="¿Eliminar Insumo Médico?"
				message={
					<p>
						Esta acción no se puede deshacer. ¿Estás seguro de que deseas
						eliminar este insumo médico?
					</p>
				}
				confirmText="Sí, eliminar definitivamente"
				cancelText="No, volver atrás"
				variant="danger"
			/>

			<CreateSupplyModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				onSuccess={fetchSupplies}
				editingSupply={supplyToEdit}
			/>
		</div>
	)
}

export default Inventory

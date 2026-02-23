import type React from "react"
import { useEffect, useState } from "react"
import {
	FaBox,
	FaExclamationTriangle,
	FaHashtag,
	FaLayerGroup,
	FaRuler,
	FaSave,
	FaTimes,
	FaWarehouse,
} from "react-icons/fa"
import { toast } from "react-toastify"
import type { Supply } from "../../../shared"
import { createSupply, updateSupplyById } from "../services/SuppliesAPI"

interface CreateSupplyModalProps {
	isOpen: boolean
	onClose: () => void
	onSuccess: () => void
	editingSupply?: Supply | null
}

const CreateSupplyModal = ({
	isOpen,
	onClose,
	onSuccess,
	editingSupply,
}: CreateSupplyModalProps) => {
	const [loading, setLoading] = useState(false)

	const initialValues: Supply = {
		id: "",
		name: "",
		category: "Descartable",
		quantity: 0,
		min_stock: 5,
		unit: "Unidades",
		status: "available",
	}
	// Estado inicial coincidiendo exactamente con tu backend
	const [formData, setFormData] = useState<Supply>(initialValues)

	// Efecto para cargar datos si es edición
	useEffect(() => {
		if (editingSupply) {
			setFormData(editingSupply)
		} else {
			setFormData(initialValues)
		}
	}, [editingSupply])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		try {
			if (editingSupply) {
				// --- MODO EDICIÓN ---

				// 1. Desestructuramos para separar el 'id' del resto de los datos
				// Usamos el nombre 'id' para extraerlo y 'updateData' para el resto
				const { id: _id, ...updateData } = formData

				// 2. Enviamos solo 'updateData' al backend
				// El ID se pasa como primer argumento para la URL, pero no en el body
				await updateSupplyById(editingSupply.id, updateData as Supply)

				toast.success("Insumo actualizado con éxito")
			} else {
				// MODO CREACIÓN
				await createSupply(formData)
				toast.success("Insumo creado correctamente")
			}
			onSuccess()
			onClose()
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Error al procesar")
		} finally {
			setLoading(false)
		}
	}

	if (!isOpen) return null

	const inputClass =
		"w-full pl-10 pr-4 py-2 border border-muted-light rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-text"

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 w-full bg-black/90 backdrop-blur-sm">
			<div className="bg-gray-100 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
				{/* Header del Modal */}
				<div className="p-6 flex justify-between items-center">
					<div>
						<h2 className="text-xl text-shadow-primary-dark font-bold">
							{editingSupply
								? `Editando: ${editingSupply.name}`
								: "Nuevo Insumo Médico"}
						</h2>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
					>
						<FaTimes size={20} />
					</button>
				</div>

				{/* Formulario */}
				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-3xl shadow-lg">
						{/* ID / Código */}
						<div className="md:col-span-2 relative">
							<label
								htmlFor="id"
								className="text-xs text-primary-dark font-bold mb-1 block ml-1"
							>
								Código Identificador (ID)
							</label>
							<div className="absolute left-3 top-1/2 -translate-y-1/2 mt-2">
								<FaHashtag className="text-muted" size={16} />
							</div>
							<input
								id="id"
								type="text"
								value={formData.id}
								disabled={!!editingSupply} // No se puede editar el ID si es edición
								required
								className={`${inputClass} ${editingSupply ? "bg-gray-100" : ""}`}
								placeholder="Ej: GASA-001"
								onChange={(e) =>
									setFormData({ ...formData, id: e.target.value })
								}
							/>
						</div>

						{/* Nombre */}
						<div className="md:col-span-2 relative">
							<label
								htmlFor="name"
								className="text-xs font-bold text-primary-dark mb-1 block ml-1"
							>
								Nombre del Insumo
							</label>
							<div className="absolute left-3 top-1/2 -translate-y-1/2 mt-2">
								<FaBox className="text-muted" size={16} />
							</div>
							<input
								id="name"
								type="text"
								value={formData.name}
								required
								className={inputClass}
								placeholder="Ej: Gasa Estéril"
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
							/>
						</div>

						{/* Categoría */}
						<div className="relative">
							<label
								htmlFor="category"
								className="text-xs font-bold text-primary-dark mb-1 block ml-1"
							>
								Categoría
							</label>
							<div className="absolute left-3 top-1/2 -translate-y-1/2 mt-2">
								<FaLayerGroup className="text-muted" size={16} />
							</div>
							<select
								id="category"
								value={formData.category}
								className={inputClass}
								onChange={(e) =>
									setFormData({ ...formData, category: e.target.value })
								}
							>
								<option value="Descartable">Descartable</option>
								<option value="No Descartable">No descartable</option>
							</select>
						</div>

						{/* Unidad */}
						<div className="relative">
							<label
								htmlFor="unit"
								className="text-xs font-bold text-primary-dark mb-1 block ml-1"
							>
								Unidad de Medida
							</label>
							<div className="absolute left-3 top-1/2 -translate-y-1/2 mt-2">
								<FaRuler className="text-muted" size={16} />
							</div>
							<input
								id="unit"
								type="text"
								value={formData.unit}
								className={inputClass}
								placeholder="Ej: Cajas, Paquetes"
								onChange={(e) =>
									setFormData({ ...formData, unit: e.target.value })
								}
							/>
						</div>

						{/* Cantidad Inicial */}
						<div className="relative">
							<label
								htmlFor="quantity"
								className="text-xs font-bold text-primary-dark mb-1 block ml-1"
							>
								Stock Inicial
							</label>
							<div className="absolute left-3 top-1/2 -translate-y-1/2 mt-2">
								<FaWarehouse className="text-muted" size={16} />
							</div>
							<input
								id="quantity"
								type="number"
								value={formData.quantity}
								required
								min="0"
								className={inputClass}
								onChange={(e) =>
									setFormData({
										...formData,
										quantity: parseInt(e.target.value, 10),
									})
								}
							/>
						</div>

						{/* Stock Mínimo */}
						<div className="relative">
							<label
								htmlFor="min_stock"
								className="text-xs font-bold text-primary-dark mb-1 block ml-1"
							>
								Alerta Stock Bajo
							</label>
							<div className="absolute left-3 top-1/2 -translate-y-1/2 mt-2">
								<FaExclamationTriangle className="text-muted" size={16} />
							</div>
							<input
								id="min_stock"
								type="number"
								value={formData.min_stock}
								required
								min="1"
								className={inputClass}
								onChange={(e) =>
									setFormData({
										...formData,
										min_stock: parseInt(e.target.value, 10),
									})
								}
							/>
						</div>
					</div>

					{/* Botones de Acción */}
					<div className="flex gap-3 pt-4">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 py-3 border-2 cursor-pointer border-muted-light text-muted font-bold rounded-2xl hover:bg-muted-light/30 transition-colors"
						>
							Cancelar
						</button>
						<button
							type="submit"
							disabled={loading}
							className="flex-1 py-3 cursor-pointer bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
						>
							{loading ? (
								"Guardando..."
							) : (
								<>
									<FaSave /> Guardar Insumo
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default CreateSupplyModal

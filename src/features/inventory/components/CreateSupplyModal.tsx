import { Select } from "antd"
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
import { Button } from "../../../shared"
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

	const labelClass = "text-xs font-bold text-gray-700 mb-1 block ml-1"
	const inputClass =
		"w-full pl-10 pr-4 py-2 border border-gray-100 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-gray-700 bg-gray-50"

	const initialValues: Supply = {
		id: "",
		name: "",
		category: "Descartable",
		quantity: 0,
		min_stock: 5,
		unit: "Unidades",
		status: "available",
	}

	const [formData, setFormData] = useState<Supply>(initialValues)

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
				const { id: _id, ...updateData } = formData
				await updateSupplyById(editingSupply.id, updateData as Supply)
				toast.success("Insumo actualizado con éxito")
			} else {
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

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 w-full bg-black/90 backdrop-blur-sm">
			<div className="bg-gray-100 w-full my-auto max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
				{/* Header */}
				<div className="p-6 pb-0 flex justify-between items-center">
					<div>
						<h2 className="text-xl font-bold text-gray-800">
							{editingSupply
								? `Editando: ${editingSupply.name}`
								: "Nuevo Insumo Médico"}
						</h2>
					</div>
					<Button
						type="button"
						variant="text"
						onClick={onClose}
						className="hover:bg-white/20 p-2! rounded-full"
					>
						<FaTimes size={20} />
					</Button>
				</div>

				{/* Formulario */}
				<form
					onSubmit={handleSubmit}
					className="p-4 space-y-4 overflow-y-auto flex-1"
				>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-3xl shadow-lg">
						{/* ID / Código */}
						<div className="md:col-span-2 relative">
							<label htmlFor="id" className={labelClass}>
								Código Identificador (ID)
							</label>
							<div className="absolute left-3 top-1/2 -translate-y-1/2 mt-2">
								<FaHashtag className="text-gray-400" size={16} />
							</div>
							<input
								id="id"
								type="text"
								value={formData.id}
								disabled={!!editingSupply}
								required
								className={`${inputClass} ${editingSupply ? "opacity-60" : ""}`}
								placeholder="Ej: GASA-001"
								onChange={(e) =>
									setFormData({ ...formData, id: e.target.value })
								}
							/>
						</div>

						{/* Nombre */}
						<div className="md:col-span-2 relative">
							<label htmlFor="name" className={labelClass}>
								Nombre del Insumo
							</label>
							<div className="absolute left-3 top-1/2 -translate-y-1/2 mt-2">
								<FaBox className="text-gray-400" size={16} />
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
							<label htmlFor="category" className={labelClass}>
								Categoría
							</label>
							<Select
								id="category"
								value={formData.category}
								className="w-full h-10"
								prefix={<FaLayerGroup className="text-gray-400 mr-2" />}
								onChange={(value) =>
									setFormData({ ...formData, category: value })
								}
								options={[
									{ value: "Descartable", label: "Descartable" },
									{ value: "No Descartable", label: "No descartable" },
								]}
							/>
						</div>

						{/* Unidad */}
						<div className="relative">
							<label htmlFor="unit" className={labelClass}>
								Unidad de Medida
							</label>
							<div className="absolute left-3 top-1/2 -translate-y-1/2 mt-2">
								<FaRuler className="text-gray-400" size={16} />
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

						{/* Stock Inicial */}
						<div className="relative">
							<label htmlFor="quantity" className={labelClass}>
								Stock Inicial
							</label>
							<div className="absolute left-3 top-1/2 -translate-y-1/2 mt-2">
								<FaWarehouse className="text-gray-400" size={16} />
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

						{/* Alerta Stock Bajo */}
						<div className="relative">
							<label htmlFor="min_stock" className={labelClass}>
								Alerta Stock Bajo
							</label>
							<div className="absolute left-3 top-1/2 -translate-y-1/2 mt-2">
								<FaExclamationTriangle className="text-gray-400" size={16} />
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
					<div className="flex gap-3 pt-2">
						<Button
							type="button"
							variant="default"
							onClick={onClose}
							className="flex-1 py-3! border-2 border-gray-300 text-gray-700 font-bold rounded-2xl"
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							disabled={loading}
							loading={loading}
							icon={<FaSave />}
							className="flex-1 py-3! font-bold rounded-2xl"
						>
							Guardar Insumo
						</Button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default CreateSupplyModal

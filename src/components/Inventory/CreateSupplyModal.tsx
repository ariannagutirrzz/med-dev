import type React from "react"
import { useState } from "react"
import { FaBox, FaHashtag, FaLayerGroup, FaSave, FaTimes } from "react-icons/fa"

interface CreateSupplyModalProps {
	isOpen: boolean
	onClose: () => void
}

const CreateSupplyModal = ({ isOpen, onClose }: CreateSupplyModalProps) => {
	// Estado inicial coincidiendo exactamente con tu backend
	const [formData, setFormData] = useState({
		id: "",
		name: "",
		category: "Material", // Valor por defecto
		quantity: 0,
		min_stock: 5,
		unit: "Unidades",
		status: "Disponible",
	})

	if (!isOpen) return null

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		// TODO: Implement API call to create supply
		// await axios.post('/api/supplies', formData)
		onClose()
	}

	const inputClass =
		"w-full pl-10 pr-4 py-2 border border-muted-light rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-text"

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 w-full bg-black/90 backdrop-blur-sm">
			<div className="bg-gray-100 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
				{/* Header del Modal */}
				<div className="p-6 flex justify-between items-center">
					<div>
						<h2 className="text-xl text-shadow-primary-dark font-bold">
							Nuevo Insumo Médico
						</h2>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="hover:bg-white/20 p-2 rounded-full transition-colors"
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
							<FaHashtag className="absolute left-3 bottom-3 text-muted" />
							<input
								id="id"
								type="text"
								required
								className={inputClass}
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
							<FaBox className="absolute left-3 bottom-3 text-muted" />
							<input
								id="name"
								type="text"
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
							<FaLayerGroup className="absolute left-3 bottom-3 text-muted" />
							<select
								id="category"
								className={inputClass}
								onChange={(e) =>
									setFormData({ ...formData, category: e.target.value })
								}
							>
								<option value="Material">Material</option>
								<option value="Protección">Protección</option>
								<option value="Insumos">Insumos</option>
								<option value="Medicamentos">Medicamentos</option>
							</select>
						</div>

						{/* Unidad */}
						<div>
							<label
								htmlFor="unit"
								className="text-xs font-bold text-primary-dark mb-1 block ml-1"
							>
								Unidad de Medida
							</label>
							<input
								id="unit"
								type="text"
								className={inputClass}
								placeholder="Ej: Cajas, Paquetes"
								onChange={(e) =>
									setFormData({ ...formData, unit: e.target.value })
								}
							/>
						</div>

						{/* Cantidad Inicial */}
						<div>
							<label
								htmlFor="quantity"
								className="text-xs font-bold text-primary-dark mb-1 block ml-1"
							>
								Stock Inicial
							</label>
							<input
								id="quantity"
								type="number"
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
						<div>
							<label
								htmlFor="min_stock"
								className="text-xs font-bold text-primary-dark mb-1 block ml-1"
							>
								Alerta Stock Bajo
							</label>
							<input
								id="min_stock"
								type="number"
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
							className="flex-1 py-3 cursor-pointer bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
						>
							<FaSave /> Guardar Insumo
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default CreateSupplyModal

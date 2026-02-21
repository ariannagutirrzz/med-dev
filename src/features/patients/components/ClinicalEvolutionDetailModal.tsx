import type React from "react"
import { useCallback, useEffect, useState } from "react"
import {
	FaCalendarAlt,
	FaClipboardList,
	FaFileImage,
	FaPills,
	FaRegEdit,
	FaRunning,
	FaSave,
	FaStethoscope,
	FaStickyNote,
	FaTimes,
	FaTrash,
	FaUserMd,
} from "react-icons/fa"
import type { MedicalHistory, MedicalHistoryFormData } from "../../../shared"
import { ConfirmModal } from "../../../shared"

interface ClinicalEvolutionDetailModalProps {
	isOpen: boolean
	onClose: () => void
	record: MedicalHistory | MedicalHistoryFormData | null
	onSave: (data: MedicalHistory | MedicalHistoryFormData) => Promise<void>
	onDelete: (id: number) => Promise<void> // Añadida para la lógica de eliminación
}

const ClinicalEvolutionDetailModal = ({
	isOpen,
	onClose,
	record,
	onSave,
	onDelete,
}: ClinicalEvolutionDetailModalProps) => {
	const [formData, setFormData] = useState<
		MedicalHistory | MedicalHistoryFormData | null
	>(null)
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

	useEffect(() => {
		if (record) {
			setFormData({
				...record,
				reason: record.reason || "",
				background: record.background || "",
				physical_exam: record.physical_exam || "",
				rx_torax: record.rx_torax || "",
				tomografia: record.tomografia || "",
				record_date: record.record_date
					? new Date(record.record_date)
					: new Date(),
			})
		}
	}, [record])

	if (!isOpen || !record || !formData) return null

	const isEditing = "id" in record && record.id !== undefined

	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const { name, value } = e.target
		setFormData((prev) => {
			if (!prev) return null
			if (name === "record_date") {
				return { ...prev, record_date: new Date(value) }
			}
			return { ...prev, [name]: value }
		})
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, files } = e.target
		if (files?.[0]) {
			setFormData((prev) => (prev ? { ...prev, [name]: files[0] } : null))
		}
	}

	const getFileName = (field: string | File | undefined) => {
		if (!field) return "Subir imagen"
		if (field instanceof File) return field.name
		return "Imagen actual (Click para cambiar)"
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (formData) {
			await onSave(formData)
		}
	}

	// Lógica idéntica a PatientModalForm
	const handleDelete = async () => {
		if (isEditing) {
			await onDelete((record as MedicalHistory).id)
			setShowDeleteConfirm(false)
			onClose()
		}
	}

	const labelClass =
		"text-xs font-black text-primary uppercase tracking-wider mb-2 flex items-center gap-2"
	const inputBaseClass =
		"w-full bg-gray-50 p-3 rounded-xl border border-gray-100 text-gray-700 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
	const fileInputClass =
		"flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"

	return (
		<>
			<div className="fixed inset-0 z-100 flex items-center justify-center p-4 w-full bg-black/80 backdrop-blur-sm">
				<div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
					{/* Header */}
					<div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
						<div className="flex items-center gap-4">
							<div className="bg-primary/10 p-3 rounded-2xl text-primary">
								<FaClipboardList size={24} />
							</div>
							<div>
								<h2 className="text-xl font-bold text-gray-800">
									{isEditing
										? "Detalle de Evolución Clínica"
										: "Nueva Evolución Clínica"}
								</h2>
								<p className="text-xs font-bold text-gray-400 uppercase">
									{isEditing
										? `Registro #${(record as MedicalHistory).id}`
										: "Completar información"}
								</p>
							</div>
						</div>
						<button
							type="button"
							onClick={onClose}
							className="hover:bg-gray-200 p-2 rounded-full text-gray-400 cursor-pointer transition-colors"
						>
							<FaTimes />
						</button>
					</div>

					<form onSubmit={handleSubmit}>
						<div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
							{/* ... (Tus campos de formulario se mantienen iguales) ... */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex flex-col">
									<label htmlFor="record_date" className={labelClass}>
										<FaCalendarAlt /> Fecha de Consulta
									</label>
									<input
										type="date"
										name="record_date"
										required
										className={inputBaseClass}
										value={
											formData.record_date
												? new Date(formData.record_date)
														.toISOString()
														.split("T")[0]
												: ""
										}
										onChange={handleInputChange}
									/>
								</div>
								<div className="flex flex-col">
									<label htmlFor="doctor_id" className={labelClass}>
										<FaUserMd /> Médico Tratante
									</label>
									<select
										name="doctor_id"
										className={inputBaseClass}
										value={formData.doctor_id}
										onChange={handleInputChange}
									>
										<option value={formData.doctor_id}>
											Médico Actual (ID: {formData.doctor_id})
										</option>
										<option value="cedula1">Dr. Carlos Mendoza</option>
										<option value="7695182">Dra. Ninive Azuaje</option>
									</select>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label htmlFor="reason" className={labelClass}>
										<FaClipboardList className="text-purple-400" /> Motivo
									</label>
									<textarea
										name="reason"
										rows={2}
										className={inputBaseClass}
										value={formData.reason}
										onChange={handleInputChange}
									/>
								</div>
								<div>
									<label htmlFor="background" className={labelClass}>
										<FaStickyNote className="text-blue-400" /> Antecedentes
									</label>
									<textarea
										name="background"
										rows={2}
										className={inputBaseClass}
										value={formData.background}
										onChange={handleInputChange}
									/>
								</div>
							</div>

							<div>
								<label htmlFor="physical_exam" className={labelClass}>
									<FaRunning className="text-green-400" /> Examen Físico
								</label>
								<textarea
									name="physical_exam"
									rows={3}
									className={`${inputBaseClass} border-l-4 border-l-green-400`}
									value={formData.physical_exam}
									onChange={handleInputChange}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label htmlFor="diagnosis" className={labelClass}>
										<FaStethoscope className="text-red-400" /> Diagnóstico
									</label>
									<textarea
										name="diagnosis"
										rows={3}
										required
										className={`${inputBaseClass} border-l-4 border-l-red-400`}
										value={formData.diagnosis}
										onChange={handleInputChange}
									/>
								</div>
								<div>
									<label htmlFor="treatment" className={labelClass}>
										<FaPills className="text-blue-400" /> Tratamiento
									</label>
									<textarea
										name="treatment"
										rows={3}
										required
										className={`${inputBaseClass} border-l-4 border-l-blue-400`}
										value={formData.treatment}
										onChange={handleInputChange}
									/>
								</div>
							</div>

							<div>
								<label htmlFor="notes" className={labelClass}>
									<FaRegEdit className="text-amber-500" /> Notas
								</label>
								<textarea
									name="notes"
									rows={2}
									className={`${inputBaseClass} border-l-4 border-l-amber-500`}
									value={formData.notes || ""}
									onChange={handleInputChange}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label htmlFor="rx_torax" className={labelClass}>
										<FaFileImage /> Rx de Tórax
									</label>
									<label className={fileInputClass}>
										<FaFileImage className="text-gray-300 text-3xl mb-2" />
										<span className="text-[10px] text-gray-500 font-black uppercase text-center px-4">
											{getFileName(formData.rx_torax)}
										</span>
										<input
											type="file"
											name="rx_torax"
											className="hidden"
											onChange={handleFileChange}
											accept="image/*"
										/>
									</label>
								</div>
								<div>
									<label htmlFor="tomografia" className={labelClass}>
										<FaFileImage /> Tomografía
									</label>
									<label className={fileInputClass}>
										<FaFileImage className="text-gray-300 text-3xl mb-2" />
										<span className="text-[10px] text-gray-500 font-black uppercase text-center px-4">
											{getFileName(formData.tomografia)}
										</span>
										<input
											type="file"
											name="tomografia"
											className="hidden"
											onChange={handleFileChange}
											accept="image/*"
										/>
									</label>
								</div>
							</div>
						</div>

						{/* Footer - Implementación EXACTA a PatientModalForm */}
						<div className="p-6 bg-gray-50 flex flex-wrap justify-between items-center gap-3 border-t border-gray-100">
							<div>
								{isEditing && (
									<button
										type="button"
										onClick={() => setShowDeleteConfirm(true)}
										className="px-4 py-2 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-all flex items-center gap-2 group cursor-pointer"
									>
										<FaTrash className="group-hover:shake" />
										<span>Eliminar Evolución</span>
									</button>
								)}
							</div>

							<div className="flex gap-3">
								<button
									type="button"
									onClick={onClose}
									className="px-6 py-3 cursor-pointer bg-white border-2 border-gray-200 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-all"
								>
									Cancelar
								</button>
								<button
									type="submit"
									className="px-8 py-3 bg-primary cursor-pointer text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-lg flex items-center gap-2"
								>
									<FaSave />{" "}
									{isEditing ? "Actualizar Registro" : "Crear Evolución"}
								</button>
							</div>
						</div>
					</form>
				</div>
			</div>

			{/* Componente Reutilizable de Confirmación */}
			<ConfirmModal
				isOpen={showDeleteConfirm}
				onClose={() => setShowDeleteConfirm(false)}
				onConfirm={handleDelete}
				title="¿Eliminar evolución clínica?"
				message={
					<p>
						Estás a punto de borrar el registro del día{" "}
						<strong>{formData.record_date?.toLocaleDateString()}</strong>. Los
						diagnósticos, tratamientos e imágenes adjuntas se perderán
						permanentemente.
					</p>
				}
				confirmText="Sí, eliminar definitivamente"
				cancelText="No, volver atrás"
				variant="danger"
			/>
		</>
	)
}

export default ClinicalEvolutionDetailModal

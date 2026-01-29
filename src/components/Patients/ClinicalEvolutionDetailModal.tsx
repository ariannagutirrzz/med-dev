import type React from "react"
import { useEffect, useState } from "react"
import {
	FaCalendarAlt,
	FaClipboardList,
	FaFileImage,
	FaPills,
	FaRunning,
	FaSave,
	FaStethoscope,
	FaStickyNote,
	FaTimes,
	FaUserMd,
} from "react-icons/fa"
import type { MedicalHistory } from "../../types"

interface ClinicalEvolutionDetailModalProps {
	isOpen: boolean
	onClose: () => void
	record: MedicalHistory | null
	onSave: (updatedRecord: MedicalHistory) => void
}

const ClinicalEvolutionDetailModal = ({
	isOpen,
	onClose,
	record,
	onSave,
}: ClinicalEvolutionDetailModalProps) => {
	const [formData, setFormData] = useState<MedicalHistory | null>(null)

	useEffect(() => {
		if (record) {
			setFormData({
				...record,
				reason: record.reason || "",
				background: record.background || "",
				physical_exam: record.physical_exam || "",
				rx_torax: record.rx_torax || "",
				tomografia: record.tomografia || "",
			})
		}
	}, [record])

	if (!isOpen || !record || !formData) return null

	const handleInputChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const { name, value } = e.target

		setFormData((prev) => {
			if (!prev) return null // Validación de nulidad para evitar errores de tipo

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

	// Helper para mostrar el nombre del archivo o la URL existente
	const getFileName = (field: string | File | undefined) => {
		if (!field) return "Subir imagen"
		if (field instanceof File) return field.name
		return "Imagen actual (Click para cambiar)"
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		onSave(formData)
		onClose()
	}

	const labelClass =
		"text-xs font-black text-primary uppercase tracking-wider mb-2 flex items-center gap-2"
	const inputBaseClass =
		"w-full bg-gray-50 p-3 rounded-xl border border-gray-100 text-gray-700 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
	const fileInputClass =
		"flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"

	return (
		<div className="fixed inset-0 z-70 flex items-center justify-center p-4 w-full bg-black/80 backdrop-blur-sm">
			<div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
				{/* Header */}
				<div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
					<div className="flex items-center gap-4">
						<div className="bg-primary/10 p-3 rounded-2xl text-primary">
							<FaClipboardList size={24} />
						</div>
						<div>
							<h2 className="text-xl font-bold text-gray-800">
								Evolución Clínica Completa
							</h2>
							<p className="text-xs font-bold text-gray-400 uppercase">
								Registro #{record.id}
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="hover:bg-gray-200 p-2 rounded-full text-gray-400"
					>
						<FaTimes />
					</button>
				</div>

				<form onSubmit={handleSubmit}>
					<div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
						{/* 1. Datos Básicos */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="flex flex-col">
								<label htmlFor="record_date" className={labelClass}>
									<FaCalendarAlt /> Fecha
								</label>
								<input
									type="date"
									name="record_date"
									className={inputBaseClass}
									value={formData.record_date.toISOString().split("T")[0]}
									onChange={handleInputChange}
								/>
							</div>
							<div className="flex flex-col">
								<label htmlFor="doctor_id" className={labelClass}>
									<FaUserMd /> Médico
								</label>
								<select
									name="doctor_id"
									className={inputBaseClass}
									value={formData.doctor_id}
									onChange={handleInputChange}
								>
									<option value="1">Dr. Juan Pérez</option>
									<option value="2">Dra. María López</option>
								</select>
							</div>
						</div>

						{/* 2. Motivo y Antecedentes */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label htmlFor="reason" className={labelClass}>
									<FaClipboardList className="text-purple-400" /> Motivo de
									Consulta
								</label>
								<textarea
									name="reason"
									rows={2}
									className={inputBaseClass}
									value={formData.reason}
									onChange={handleInputChange}
									placeholder="¿Por qué acude el paciente?"
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
									placeholder="Patologías previas..."
								/>
							</div>
						</div>

						{/* 3. Examen Físico */}
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
								placeholder="Hallazgos del examen..."
							/>
						</div>

						{/* 4. Diagnóstico y Tratamiento */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label htmlFor="diagnosis" className={labelClass}>
									<FaStethoscope className="text-red-400" /> Diagnóstico
								</label>
								<textarea
									name="diagnosis"
									rows={3}
									className={`${inputBaseClass} border-l-4 border-l-red-400`}
									value={formData.diagnosis}
									onChange={handleInputChange}
									required
								/>
							</div>
							<div>
								<label htmlFor="treatment" className={labelClass}>
									<FaPills className="text-blue-400" /> Tratamiento
								</label>
								<textarea
									name="treatment"
									rows={3}
									className={`${inputBaseClass} border-l-4 border-l-blue-400`}
									value={formData.treatment}
									onChange={handleInputChange}
									required
								/>
							</div>
						</div>

						{/* 5. Subida de Imágenes */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label htmlFor="rx_torax" className={labelClass}>
									<FaFileImage /> Rx de Tórax
								</label>
								<label className={fileInputClass}>
									<FaFileImage className="text-gray-300 text-3xl mb-2" />
									<span className="text-xs text-gray-500 font-medium">
										<span className="text-xs text-gray-500 font-medium">
											{getFileName(formData.rx_torax)}
										</span>
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
									<span className="text-xs text-gray-500 font-medium">
										{getFileName(formData.rx_torax)}
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

					{/* Footer */}
					<div className="p-6 bg-gray-50 flex justify-end gap-3">
						<button
							type="button"
							onClick={onClose}
							className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-all"
						>
							Cancelar
						</button>
						<button
							type="submit"
							className="px-8 py-3 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-all shadow-lg flex items-center gap-2"
						>
							<FaSave /> Guardar Registro
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default ClinicalEvolutionDetailModal

import type React from "react"
import { useEffect, useState } from "react"
import {
	FaCalendarAlt,
	FaClipboardList,
	FaFileImage,
	FaImage,
	FaPills,
	FaPlus,
	FaRegEdit,
	FaRunning,
	FaSave,
	FaStethoscope,
	FaStickyNote,
	FaTimes,
	FaTrash,
	FaUserMd,
} from "react-icons/fa"
import type {
	ExtraImages,
	MedicalHistory,
	MedicalHistoryFormData,
} from "../../../shared"
import { Button, ConfirmModal } from "../../../shared"
import {
	deleteExtraImage,
	getExtraImages,
	updateExtraImage,
	uploadExtraImages,
} from "../services/MedicalRecordsImagesAPI"

interface ClinicalEvolutionDetailModalProps {
	isOpen: boolean
	onClose: () => void
	record: MedicalHistory | MedicalHistoryFormData | null
	onSave: (data: MedicalHistoryFormData) => Promise<void> // Tipado más estricto
	onDelete: (id: number) => Promise<void>
}

const ClinicalEvolutionDetailModal = ({
	isOpen,
	onClose,
	record,
	onSave,
	onDelete,
}: ClinicalEvolutionDetailModalProps) => {
	// Usamos MedicalHistoryFormData para el estado local
	const [formData, setFormData] = useState<MedicalHistoryFormData | null>(null)
	const [extraImages, setExtraImages] = useState<ExtraImages[]>([])
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
	const [isSaving, setIsSaving] = useState(false)

	useEffect(() => {
		if (record) {
			setFormData({
				...record,
				reason: record.reason || "",
				background: record.background || "",
				physical_exam: record.physical_exam || "",
				rx_torax: record.rx_torax || "",
				tomography: record.tomography || "",
				record_date: record.record_date
					? new Date(record.record_date)
					: new Date(),
			} as MedicalHistoryFormData)

			// si tenemos un id es edición, traemos imágenes existentes
			if ((record as MedicalHistory).id) {
				getExtraImages((record as MedicalHistory).id).then((imgs) => {
					setExtraImages(
						imgs.map((i: { id: number; title: string; url?: string }) => ({
							id: i.id,
							title: i.title,
							url: i.url,
							isNew: false,
						})),
					)
				})
			} else {
				// creación nueva: limpiar cualquier dato previo
				setExtraImages([])
			}
		} else {
			// modal cerrado o record null: reset estado
			setFormData(null)
			setExtraImages([])
		}
	}, [record])

	// --- Lógica para Imágenes Extras ---

	const addExtraImageField = async () => {
		// si estamos editando ya tenemos id de record, creamos placeholder en DB
		if (formData?.id) {
			try {
				const resp = await uploadExtraImages(formData.id, [""], [])
				// resp.images puede contener un registro con url null
				const created = resp.images[0]
				setExtraImages((prev) => [
					...prev,
					{ id: created.id, title: "", url: undefined, isNew: true },
				])
			} catch (e) {
				console.error("Error creando campo extra:", e)
			}
		} else {
			setExtraImages((prev) => [...prev, { title: "", isNew: true }])
		}
	}

	const handleExtraImageChange = async (
		index: number,
		field: keyof ExtraImages,
		value: string | File | undefined,
	) => {
		const updated = [...extraImages]
		updated[index] = { ...updated[index], [field]: value }
		setExtraImages(updated)

		// si ya existe en DB y cambió el título
		if (field === "title" && updated[index].id) {
			try {
				const form = new FormData()
				if (typeof value === "string") {
					form.append("title", value)
				}
				await updateExtraImage(updated[index].id as number, form)
			} catch (e) {
				console.error("Error actualizando título extra:", e)
			}
		}
	}

	const handleFileExtraChange = async (
		index: number,
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		if (e.target.files?.[0]) {
			const file = e.target.files[0]
			handleExtraImageChange(index, "url", file)
			// si ya existe en DB, subir archivo inmediato
			const img = extraImages[index]
			if (img.id && formData?.id) {
				const form = new FormData()
				form.append("title", img.title)
				form.append("extra_image_file", file)
				try {
					await updateExtraImage(img.id as number, form)
				} catch (err) {
					console.error("Error subiendo archivo extra:", err)
				}
			} else if (formData?.id) {
				// crear en DB con archivo
				try {
					const resp = await uploadExtraImages(formData.id, img.title, [file])
					const created = resp.images[0]
					setExtraImages((prev) => {
						const newArr = [...prev]
						newArr[index] = {
							...newArr[index],
							id: created.id,
							url: created.url,
							isNew: false,
						}
						return newArr
					})
				} catch (err) {
					console.error("Error creando imagen extra con archivo:", err)
				}
			}
		}
	}

	const removeExtraImage = async (index: number) => {
		const image = extraImages[index]

		// Si la imagen ya existe en la DB, llamamos al delete del backend
		if (image.id) {
			try {
				await deleteExtraImage(image.id as number)
			} catch (error) {
				console.error(error)
				return // No eliminar de UI si falla
			}
		}

		setExtraImages((prev) => prev.filter((_, i) => i !== index))
	}

	// --- Función auxiliar para renderizar los campos extra ---
	const renderExtraImages = () => (
		<div className="space-y-6 mt-6 border-t border-gray-100 pt-6">
			<label htmlFor="rx_torax" className={labelClass}>
				<FaFileImage /> Estudios adicionales
			</label>

			<div className="grid grid-cols-1 gap-6">
				{extraImages.map((img, index) => (
					<div
						key={img.id}
						className="bg-gray-50/50 p-4 rounded-4xl border border-gray-100 relative group"
					>
						{/* Botón Eliminar Campo */}
						<button
							type="button"
							onClick={() => removeExtraImage(index)}
							className="absolute -top-2 -right-2 bg-white p-2 rounded-full border-red-500 border cursor-pointer shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
						>
							<FaTrash className="text-red-500" size={12} />
						</button>

						<div className="space-y-3">
							{/* Input de Título */}
							<input
								type="text"
								placeholder="Título del estudio (ej: Eco Renal)"
								className={`${inputBaseClass} text-xs font-bold! h-10`}
								value={img.title}
								onChange={(e) =>
									handleExtraImageChange(index, "title", e.target.value)
								}
							/>

							{/* Dropzone de Imagen */}
							<label className={`${fileInputClass} h-24`}>
								<FaImage className="text-gray-300 text-2xl mb-1" />
								<span className="text-[10px] text-gray-500 font-black uppercase text-center px-4 line-clamp-1">
									{getFileName(img.url)}
								</span>
								<input
									type="file"
									className="hidden"
									onChange={(e) => handleFileExtraChange(index, e)}
									accept="image/*"
								/>
							</label>

							{/* Botón Descargar si existe */}
							{img.url && (
								<Button
									type="button"
									variant="text"
									onClick={() => handleDownload(img.url, img.title)}
									className="w-full! text-[10px] font-bold! text-primary!"
								>
									Ver imagen actual
								</Button>
							)}
						</div>
					</div>
				))}
			</div>

			<Button
				type="button"
				variant="default"
				onClick={addExtraImageField}
				icon={<FaPlus />}
				className="w-full! border-2! border-dashed! border-gray-200! text-gray-400! hover:border-primary! hover:text-primary! transition-all!"
			>
				Añadir otro estudio o imagen
			</Button>
		</div>
	)

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
		if (!formData) return

		try {
			setIsSaving(true)
			const dataToSave = {
				...formData,
			}
			await onSave(dataToSave)
			// si era creación limpia los campos extra para no arrastrarlos
			if (!isEditing) {
				setExtraImages([])
			}
		} finally {
			setIsSaving(false)
		}
	}

	const handleDelete = async () => {
		if (isEditing && "id" in record) {
			await onDelete(record.id as number)
			setShowDeleteConfirm(false)
			onClose()
		}
	}

	const handleDownload = async (
		field: string | File | undefined,
		fileName: string,
	) => {
		if (!field) return

		try {
			let url: string
			let name: string

			if (field instanceof File) {
				url = URL.createObjectURL(field)
				name = field.name
			} else {
				// Es un link de Supabase
				const response = await fetch(field)
				const blob = await response.blob()
				url = URL.createObjectURL(blob)
				name = `${fileName}-${record?.id || "registro"}.jpg`
			}

			const link = document.createElement("a")
			link.href = url
			link.download = name
			document.body.appendChild(link)
			link.click()

			// Limpieza
			document.body.removeChild(link)
			URL.revokeObjectURL(url)
		} catch (error) {
			console.error("Error al descargar:", error)
			// Si falla el fetch por CORS, abrimos en pestaña nueva como fallback
			if (typeof field === "string") window.open(field, "_blank")
		}
	}

	// Estilos (se mantienen igual para no romper tu UI)
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
						<Button
							type="button"
							variant="text"
							onClick={onClose}
							icon={<FaTimes />}
							className="p-2! rounded-full text-gray-400 hover:bg-gray-200!"
						/>
					</div>

					<form onSubmit={handleSubmit}>
						<div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
							{/* Fecha y Médico */}
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
											formData.record_date?.toISOString().split("T")[0] || ""
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
										<option value="">Seleccionar médico</option>
										<option value="cedula1">Dr. Carlos Mendoza</option>
										<option value="7695182">Dra. Ninive Azuaje</option>
									</select>
								</div>
							</div>

							{/* Motivo y Antecedentes */}
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

							{/* Examen Físico */}
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

							{/* Diagnóstico y Tratamiento */}
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

							{/* Notas */}
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

							{/* Imágenes */}
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

									{formData.rx_torax && (
										<Button
											type="button"
											variant="text"
											onClick={() =>
												handleDownload(formData.rx_torax, "rx-torax")
											}
											className="w-full! text-[10px] font-bold! text-primary!"
										>
											Ver imagen actual
										</Button>
									)}
								</div>
								<div>
									<label htmlFor="tomography" className={labelClass}>
										<FaFileImage /> Tomografía
									</label>
									<label className={fileInputClass}>
										<FaFileImage className="text-gray-300 text-3xl mb-2" />
										<span className="text-[10px] text-gray-500 font-black uppercase text-center px-4">
											{getFileName(formData.tomography)}
										</span>
										<input
											type="file"
											name="tomography"
											className="hidden"
											onChange={handleFileChange}
											accept="image/*"
										/>
									</label>
									{formData.tomography && (
										<Button
											type="button"
											variant="text"
											onClick={() =>
												handleDownload(formData.tomography, "tomografia")
											}
											className="w-full! text-[10px] font-bold! text-primary!"
										>
											Ver imagen actual
										</Button>
									)}
								</div>
								{renderExtraImages()}
							</div>
						</div>

						{/* Footer */}
						<div className="p-6 bg-gray-50 flex flex-wrap justify-between items-center gap-3 border-t border-gray-100">
							<div>
								{isEditing && (
									<Button
										type="button"
										variant="default"
										danger
										onClick={() => setShowDeleteConfirm(true)}
										icon={<FaTrash />}
									>
										Eliminar Evolución
									</Button>
								)}
							</div>

							<div className="flex gap-3">
								<Button
									type="button"
									variant="default"
									onClick={onClose}
									className="border-2! border-gray-200! text-gray-500!"
								>
									Cancelar
								</Button>
								<Button
									type="submit"
									variant="primary"
									loading={isSaving}
									disabled={isSaving}
									icon={<FaSave />}
									className="shadow-lg!"
								>
									{isSaving
										? "Guardando..."
										: isEditing
											? "Actualizar Registro"
											: "Crear Evolución"}
								</Button>
							</div>
						</div>
					</form>
				</div>
			</div>

			<ConfirmModal
				isOpen={showDeleteConfirm}
				onClose={() => setShowDeleteConfirm(false)}
				onConfirm={handleDelete}
				title="¿Eliminar evolución clínica?"
				message={
					<p>
						Estás a punto de borrar el registro del día{" "}
						<strong>{formData.record_date?.toLocaleDateString()}</strong>.
						Diagnósticos e imágenes se perderán permanentemente.
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

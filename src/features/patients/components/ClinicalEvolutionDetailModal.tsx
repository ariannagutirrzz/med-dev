import { DatePicker, Select } from "antd"
import dayjs from "dayjs"
import type React from "react"
import { useEffect, useState } from "react"
import {
	FaFileImage,
	FaImage,
	FaPlus,
	FaSave,
	FaTimes,
	FaTrash,
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
		<div className="md:col-span-2 space-y-4 border-t border-gray-100 pt-4">
			<label htmlFor="image" className={labelClass}>
				Estudios adicionales
			</label>
			<div className="grid grid-cols-1 gap-4">
				{extraImages.map((img, index) => (
					<div
						key={img.id}
						className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 relative group"
					>
						<button
							type="button"
							onClick={() => removeExtraImage(index)}
							className="absolute -top-2 -right-2 bg-white p-2 rounded-full border-red-500 border cursor-pointer shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
						>
							<FaTrash className="text-red-500" size={12} />
						</button>
						<div className="space-y-3">
							<input
								type="text"
								placeholder="Título del estudio (ej: Eco Renal)"
								className={`${inputBaseClass} text-xs font-bold! h-10`}
								value={img.title}
								onChange={(e) =>
									handleExtraImageChange(index, "title", e.target.value)
								}
							/>
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
	const labelClass = "text-xs font-bold text-gray-700 mb-1 block ml-1"
	const inputBaseClass =
		"w-full bg-gray-50 p-3 rounded-xl border border-gray-100 text-gray-700 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
	const fileInputClass =
		"flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"

	return (
		<>
			<div className="fixed inset-0 z-100 flex items-center justify-center p-4 w-full bg-black/90 backdrop-blur-sm">
				<div className="relative bg-gray-100 w-full my-auto max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
					{/* Header */}
					<div className="p-6 pb-0 flex justify-between items-center">
						<div>
							<h2 className="text-xl font-bold text-gray-800">
								{isEditing
									? "Detalle de Evolución Clínica"
									: "Nueva Evolución Clínica"}
							</h2>
							{isEditing &&
							formData.doctor_name &&
							String(formData.doctor_name).trim() !== "" ? (
								<p className="text-sm text-gray-500 mt-1">
									Médico:{" "}
									<span className="font-semibold text-gray-700">
										{formData.doctor_name}
									</span>
								</p>
							) : null}
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
						<div className="bg-white p-4 rounded-3xl shadow-lg space-y-4">
							{/* Fecha y Médico */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex flex-col">
									<label htmlFor="record_date" className={labelClass}>
										Fecha de Consulta
									</label>
									<DatePicker
										id="record_date"
										placeholder="Seleccionar fecha"
										className="w-full h-10"
										format="DD/MM/YYYY"
										value={
											formData.record_date ? dayjs(formData.record_date) : null
										}
										onChange={(date) => {
											setFormData((prev) => {
												if (!prev) return null
												return {
													...prev,
													record_date: date ? date.toDate() : new Date(),
												}
											})
										}}
									/>
								</div>
								<div className="flex flex-col">
									<label htmlFor="doctor_id" className={labelClass}>
										Médico Tratante
									</label>
									<Select
										id="doctor_id"
										className="w-full h-10"
										placeholder="Seleccionar médico"
										value={formData.doctor_id || undefined}
										onChange={(value) =>
											setFormData((prev) =>
												prev ? { ...prev, doctor_id: value } : null,
											)
										}
										options={[
											{ value: "cedula1", label: "Dr. Carlos Mendoza" },
											{ value: "7695182", label: "Dra. Ninive Azuaje" },
										]}
									/>
								</div>
							</div>

							{/* Motivo y Antecedentes */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex flex-col">
									<label htmlFor="reason" className={labelClass}>
										Motivo
									</label>
									<textarea
										name="reason"
										rows={2}
										className={inputBaseClass}
										value={formData.reason}
										onChange={handleInputChange}
									/>
								</div>
								<div className="flex flex-col">
									<label htmlFor="background" className={labelClass}>
										Antecedentes
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
							<div className="flex flex-col">
								<label htmlFor="physical_exam" className={labelClass}>
									Examen Físico
								</label>
								<textarea
									name="physical_exam"
									rows={3}
									className={inputBaseClass}
									value={formData.physical_exam}
									onChange={handleInputChange}
								/>
							</div>

							{/* Diagnóstico y Tratamiento */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex flex-col">
									<label htmlFor="diagnosis" className={labelClass}>
										Diagnóstico
									</label>
									<textarea
										name="diagnosis"
										rows={3}
										required
										className={inputBaseClass}
										value={formData.diagnosis}
										onChange={handleInputChange}
									/>
								</div>
								<div className="flex flex-col">
									<label htmlFor="treatment" className={labelClass}>
										Tratamiento
									</label>
									<textarea
										name="treatment"
										rows={3}
										required
										className={inputBaseClass}
										value={formData.treatment}
										onChange={handleInputChange}
									/>
								</div>
							</div>

							{/* Notas */}
							<div className="flex flex-col">
								<label htmlFor="notes" className={labelClass}>
									Notas
								</label>
								<textarea
									name="notes"
									rows={2}
									className={inputBaseClass}
									value={formData.notes || ""}
									onChange={handleInputChange}
								/>
							</div>

							{/* Imágenes */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex flex-col">
									<label htmlFor="rx_torax" className={labelClass}>
										Rx de Tórax
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
								<div className="flex flex-col">
									<label htmlFor="tomography" className={labelClass}>
										Tomografía
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

								{/* Estudios adicionales */}
								{renderExtraImages()}
							</div>
						</div>

						{/* Botones de Acción */}
						<div className="flex gap-3 pt-2">
							{isEditing && (
								<Button
									type="button"
									variant="default"
									danger
									onClick={() => setShowDeleteConfirm(true)}
									icon={<FaTrash />}
									className="py-3! border-2 border-red-200 rounded-2xl"
								>
									Eliminar
								</Button>
							)}
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
								loading={isSaving}
								disabled={isSaving}
								icon={<FaSave />}
								className="flex-1 py-3! font-bold rounded-2xl"
							>
								{isSaving
									? "Guardando..."
									: isEditing
										? "Actualizar Registro"
										: "Crear Evolución"}
							</Button>
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

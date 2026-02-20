import { Select, TimePicker } from "antd"
import type { Dayjs } from "dayjs"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import { useCallback, useEffect, useState } from "react"
import { FaCalendarAlt, FaClock, FaEdit, FaPlus, FaTrash } from "react-icons/fa"
import "dayjs/locale/es"
import { toast } from "react-toastify"
import { ConfirmModal } from "../../../shared"
import {
	createDoctorAvailability,
	type DoctorAvailability,
	type DoctorAvailabilityFormData,
	deleteDoctorAvailability,
	getDoctorAvailability,
	updateDoctorAvailability,
} from "../../appointments/services/DoctorAvailabilityAPI"
import { useAuth } from "../../auth"

dayjs.extend(customParseFormat)
dayjs.locale("es")

const DAYS_OF_WEEK = [
	{ value: 0, label: "Domingo" },
	{ value: 1, label: "Lunes" },
	{ value: 2, label: "Martes" },
	{ value: 3, label: "Miércoles" },
	{ value: 4, label: "Jueves" },
	{ value: 5, label: "Viernes" },
	{ value: 6, label: "Sábado" },
]

const DoctorAvailabilityManagement: React.FC = () => {
	const { user } = useAuth()
	const [availability, setAvailability] = useState<DoctorAvailability[]>([])
	const [loading, setLoading] = useState(true)
	const [showModal, setShowModal] = useState(false)
	const [editingSlot, setEditingSlot] = useState<DoctorAvailability | null>(
		null,
	)
	const [deleteConfirm, setDeleteConfirm] = useState<{
		isOpen: boolean
		slot: DoctorAvailability | null
	}>({ isOpen: false, slot: null })
	const [formData, setFormData] = useState<DoctorAvailabilityFormData>({
		day_of_week: 1,
		start_time: "09:00",
		end_time: "17:00",
		is_active: true,
	})

	const loadAvailability = useCallback(async () => {
		if (!user?.document_id) return

		try {
			setLoading(true)
			const data = await getDoctorAvailability(user.document_id)
			setAvailability(data.availability || [])
		} catch (error) {
			console.error("Error loading availability:", error)
			toast.error("Error al cargar la disponibilidad")
		} finally {
			setLoading(false)
		}
	}, [user?.document_id])

	useEffect(() => {
		loadAvailability()
	}, [loadAvailability])

	const handleOpenModal = (
		slot?:
			| DoctorAvailability
			| {
					day_of_week: number
					start_time: string
					end_time: string
					is_active: boolean
			  },
	) => {
		if (slot && "id" in slot) {
			// Editing existing slot
			setEditingSlot(slot)
			setFormData({
				day_of_week: slot.day_of_week,
				start_time: slot.start_time.slice(0, 5), // HH:MM format
				end_time: slot.end_time.slice(0, 5), // HH:MM format
				is_active: slot.is_active,
			})
		} else if (slot) {
			// New slot with pre-selected day
			setEditingSlot(null)
			setFormData({
				day_of_week: slot.day_of_week,
				start_time: slot.start_time,
				end_time: slot.end_time,
				is_active: slot.is_active,
			})
		} else {
			// New slot without pre-selection
			setEditingSlot(null)
			setFormData({
				day_of_week: 1,
				start_time: "09:00",
				end_time: "17:00",
				is_active: true,
			})
		}
		setShowModal(true)
	}

	const handleCloseModal = () => {
		setShowModal(false)
		setEditingSlot(null)
		setFormData({
			day_of_week: 1,
			start_time: "09:00",
			end_time: "17:00",
			is_active: true,
		})
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!user?.document_id) return

		// Validate time range
		if (formData.end_time <= formData.start_time) {
			toast.error("La hora de fin debe ser posterior a la hora de inicio")
			return
		}

		try {
			if (editingSlot) {
				await updateDoctorAvailability(editingSlot.id, formData)
				toast.success("Horario actualizado exitosamente")
			} else {
				await createDoctorAvailability(formData)
				toast.success("Horario creado exitosamente")
			}
			handleCloseModal()
			loadAvailability()
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Error al guardar el horario"
			toast.error(message)
		}
	}

	const handleDelete = async () => {
		if (!deleteConfirm.slot) return

		try {
			await deleteDoctorAvailability(deleteConfirm.slot.id)
			toast.success("Horario eliminado exitosamente")
			setDeleteConfirm({ isOpen: false, slot: null })
			loadAvailability()
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Error al eliminar el horario"
			toast.error(message)
		}
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-gray-600">Cargando disponibilidad...</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h3 className="text-lg font-semibold text-gray-800">
						Gestión de Disponibilidad
					</h3>
					<p className="text-sm text-gray-600 mt-1">
						Configura tus horarios de atención para cada día de la semana.
						Puedes establecer diferentes horarios para cada día. Los pacientes
						solo podrán agendar citas en estos horarios.
					</p>
				</div>
			</div>

			{/* Availability List - Show all days in grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{DAYS_OF_WEEK.map((day) => {
					const daySlots = availability.filter(
						(slot) => slot.day_of_week === day.value,
					)

					return (
						<div
							key={day.value}
							className="bg-white rounded-2xl shadow-lg p-5 flex flex-col min-h-[200px]"
						>
							<div className="flex items-center justify-between mb-4">
								<h4 className="text-md font-semibold text-gray-800 flex items-center gap-2">
									<FaCalendarAlt className="text-primary" />
									{day.label}
								</h4>
								<button
									type="button"
									onClick={() =>
										handleOpenModal({
											day_of_week: day.value,
											start_time: "09:00",
											end_time: "17:00",
											is_active: true,
										} as DoctorAvailability)
									}
									className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1 cursor-pointer"
									title="Agregar horario"
								>
									<FaPlus className="text-xs" />
								</button>
							</div>

							<div className="flex-1">
								{daySlots.length === 0 ? (
									<div className="text-center py-4 text-gray-400 text-xs">
										No hay horarios configurados
									</div>
								) : (
									<div className="space-y-2">
										{daySlots.map((slot) => (
											<div
												key={slot.id}
												className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary/30 transition-colors"
											>
												<div className="flex items-center gap-2 flex-1 min-w-0">
													<FaClock className="text-gray-400 text-xs shrink-0" />
													<span className="font-medium text-gray-800 text-sm truncate">
														{slot.start_time.slice(0, 5)} -{" "}
														{slot.end_time.slice(0, 5)}
													</span>
													{slot.is_active ? (
														<span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded shrink-0">
															Activo
														</span>
													) : (
														<span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded shrink-0">
															Inactivo
														</span>
													)}
												</div>
												<div className="flex items-center gap-1 shrink-0">
													<button
														type="button"
														onClick={() => handleOpenModal(slot)}
														className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
														title="Editar"
													>
														<FaEdit className="text-xs" />
													</button>
													<button
														type="button"
														onClick={() =>
															setDeleteConfirm({ isOpen: true, slot })
														}
														className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
														title="Eliminar"
													>
														<FaTrash className="text-xs" />
													</button>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					)
				})}
			</div>

			{/* Modal */}
			{showModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
					<div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
						<div className="p-6 border-b border-gray-200">
							<h3 className="text-xl font-bold text-gray-800">
								{editingSlot ? "Editar Horario" : "Nuevo Horario"}
							</h3>
						</div>

						<form onSubmit={handleSubmit} className="p-6 space-y-4">
							<div>
								<label
									htmlFor="day_of_week"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Día de la Semana
								</label>
								<Select
									value={formData.day_of_week}
									onChange={(value) =>
										setFormData({
											...formData,
											day_of_week: value,
										})
									}
									className="w-full"
									placeholder="Seleccionar día"
									options={DAYS_OF_WEEK.map((day) => ({
										value: day.value,
										label: day.label,
									}))}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label
										htmlFor="start_time"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										Hora de Inicio
									</label>
									<TimePicker
										value={
											formData.start_time
												? dayjs(formData.start_time, "HH:mm")
												: null
										}
										onChange={(time: Dayjs | null) =>
											setFormData({
												...formData,
												start_time: time ? time.format("HH:mm") : "",
											})
										}
										format="HH:mm"
										className="w-full"
										placeholder="Seleccionar hora"
										minuteStep={30}
									/>
								</div>
								<div>
									<label
										htmlFor="end_time"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										Hora de Fin
									</label>
									<TimePicker
										value={
											formData.end_time
												? dayjs(formData.end_time, "HH:mm")
												: null
										}
										onChange={(time: Dayjs | null) =>
											setFormData({
												...formData,
												end_time: time ? time.format("HH:mm") : "",
											})
										}
										format="HH:mm"
										className="w-full"
										placeholder="Seleccionar hora"
										minuteStep={30}
									/>
								</div>
							</div>

							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									id="is_active"
									checked={formData.is_active}
									onChange={(e) =>
										setFormData({
											...formData,
											is_active: e.target.checked,
										})
									}
									className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
								/>
								<label
									htmlFor="is_active"
									className="text-sm font-medium text-gray-700"
								>
									Horario activo
								</label>
							</div>

							<div className="flex gap-3 pt-4">
								<button
									type="button"
									onClick={handleCloseModal}
									className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
								>
									Cancelar
								</button>
								<button
									type="submit"
									className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors cursor-pointer"
								>
									{editingSlot ? "Actualizar" : "Crear"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={deleteConfirm.isOpen}
				onClose={() => setDeleteConfirm({ isOpen: false, slot: null })}
				onConfirm={handleDelete}
				title="¿Eliminar horario?"
				message={
					<p>
						¿Estás seguro de que deseas eliminar este horario? Los pacientes no
						podrán agendar citas en este horario después de eliminarlo.
					</p>
				}
				confirmText="Sí, eliminar"
				cancelText="Cancelar"
				variant="danger"
			/>
		</div>
	)
}

export default DoctorAvailabilityManagement

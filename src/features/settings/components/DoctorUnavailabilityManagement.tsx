import { DatePicker, Input } from "antd"
import type { Dayjs } from "dayjs"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import { useCallback, useEffect, useState } from "react"
import { FaCalendarTimes, FaEdit, FaPlus, FaTrash } from "react-icons/fa"
import "dayjs/locale/es"
import { toast } from "react-toastify"
import { Button, ConfirmModal } from "../../../shared"
import LoadingSpinner from "../../../shared/components/common/LoadingSpinner"
import {
	createDoctorUnavailability,
	type DoctorUnavailability,
	type DoctorUnavailabilityFormData,
	deleteDoctorUnavailability,
	getDoctorUnavailability,
	updateDoctorUnavailability,
} from "../../appointments/services/DoctorUnavailabilityAPI"
import { useAuth } from "../../auth"

const { TextArea } = Input

dayjs.extend(customParseFormat)
dayjs.locale("es")

const DoctorUnavailabilityManagement: React.FC = () => {
	const { user } = useAuth()
	const [unavailability, setUnavailability] = useState<DoctorUnavailability[]>(
		[],
	)
	const [loading, setLoading] = useState(true)
	const [showModal, setShowModal] = useState(false)
	const [editingPeriod, setEditingPeriod] =
		useState<DoctorUnavailability | null>(null)
	const [deleteConfirm, setDeleteConfirm] = useState<{
		isOpen: boolean
		period: DoctorUnavailability | null
	}>({ isOpen: false, period: null })
	const [formData, setFormData] = useState<DoctorUnavailabilityFormData>({
		start_date: "",
		end_date: null,
		reason: "",
		is_active: true,
	})

	const loadUnavailability = useCallback(async () => {
		if (!user?.document_id) return

		try {
			setLoading(true)
			const data = await getDoctorUnavailability(user.document_id)
			setUnavailability(data.unavailability || [])
		} catch (error) {
			console.error("Error loading unavailability:", error)
			toast.error("Error al cargar los períodos de indisponibilidad")
		} finally {
			setLoading(false)
		}
	}, [user?.document_id])

	useEffect(() => {
		loadUnavailability()
	}, [loadUnavailability])

	const handleOpenModal = (period?: DoctorUnavailability) => {
		if (period) {
			setEditingPeriod(period)
			setFormData({
				start_date: period.start_date,
				end_date: period.end_date || null,
				reason: period.reason || "",
				is_active: period.is_active,
			})
		} else {
			setEditingPeriod(null)
			setFormData({
				start_date: "",
				end_date: null,
				reason: "",
				is_active: true,
			})
		}
		setShowModal(true)
	}

	const handleCloseModal = () => {
		setShowModal(false)
		setEditingPeriod(null)
		setFormData({
			start_date: "",
			end_date: null,
			reason: "",
			is_active: true,
		})
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!user?.document_id) return

		if (!formData.start_date) {
			toast.error("La fecha de inicio es requerida")
			return
		}

		if (formData.end_date && formData.end_date < formData.start_date) {
			toast.error(
				"La fecha de fin debe ser posterior o igual a la fecha de inicio",
			)
			return
		}

		try {
			if (editingPeriod) {
				await updateDoctorUnavailability(editingPeriod.id, formData)
				toast.success("Período de indisponibilidad actualizado exitosamente")
			} else {
				await createDoctorUnavailability(formData)
				toast.success("Período de indisponibilidad creado exitosamente")
			}
			handleCloseModal()
			loadUnavailability()
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Error al guardar el período"
			toast.error(message)
		}
	}

	const handleDelete = async () => {
		if (!deleteConfirm.period) return

		try {
			await deleteDoctorUnavailability(deleteConfirm.period.id)
			toast.success("Período de indisponibilidad eliminado exitosamente")
			setDeleteConfirm({ isOpen: false, period: null })
			loadUnavailability()
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Error al eliminar el período"
			toast.error(message)
		}
	}

	const formatDateRange = (start: string, end: string | null) => {
		const startDate = dayjs(start).format("DD/MM/YYYY")
		if (!end || end === start) {
			return startDate
		}
		const endDate = dayjs(end).format("DD/MM/YYYY")
		return `${startDate} - ${endDate}`
	}

	if (loading) {
		return (
			<LoadingSpinner loadingMessage="CARGANDO PERÍODOS DE INDISPONIBILIDAD..." />
		)
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h3 className="text-lg font-semibold text-gray-800">
						Períodos de Indisponibilidad
					</h3>
					<p className="text-sm text-gray-600 mt-1">
						Define períodos específicos donde no estarás disponible (vacaciones,
						licencias, etc.). Los pacientes no podrán agendar citas durante
						estos períodos.
					</p>
				</div>
				<Button
					type="button"
					variant="primary"
					onClick={() => handleOpenModal()}
					icon={<FaPlus />}
				>
					Nuevo Período
				</Button>
			</div>

			{/* Unavailability List */}
			{unavailability.length === 0 ? (
				<div className="bg-white rounded-2xl shadow-lg p-8 text-center">
					<FaCalendarTimes className="mx-auto text-gray-400 text-4xl mb-4" />
					<p className="text-gray-600 mb-4">
						No tienes períodos de indisponibilidad configurados
					</p>
					<p className="text-sm text-gray-500 mb-6">
						Agrega períodos específicos (como semanas de vacaciones) para
						bloquear esas fechas y evitar que los pacientes agenden citas.
					</p>
					<Button
						type="button"
						variant="primary"
						onClick={() => handleOpenModal()}
					>
						Agregar Primer Período
					</Button>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{unavailability.map((period) => (
						<div
							key={period.id}
							className="bg-white rounded-2xl shadow-lg p-5 flex flex-col"
						>
							<div className="flex items-start justify-between mb-3">
								<div className="flex items-center gap-3 flex-1 min-w-0">
									<FaCalendarTimes className="text-red-500 text-lg shrink-0" />
									<div className="min-w-0 flex-1">
										<div className="font-semibold text-gray-800 text-sm">
											{formatDateRange(period.start_date, period.end_date)}
										</div>
										{period.reason && (
											<div className="text-xs text-gray-600 mt-1 truncate">
												{period.reason}
											</div>
										)}
									</div>
								</div>
								{period.is_active ? (
									<span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded shrink-0">
										Activo
									</span>
								) : (
									<span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded shrink-0">
										Inactivo
									</span>
								)}
							</div>
							<div className="flex items-center gap-2 mt-auto">
								<Button
									type="button"
									variant="default"
									onClick={() => handleOpenModal(period)}
									icon={<FaEdit className="text-xs" />}
									className="!flex-1 !py-2 !min-h-0 !text-sm !text-primary hover:!bg-primary/10"
									title="Editar"
								>
									Editar
								</Button>
								<Button
									type="button"
									variant="default"
									danger
									onClick={() => setDeleteConfirm({ isOpen: true, period })}
									icon={<FaTrash className="text-xs" />}
									className="!flex-1 !py-2 !min-h-0 !text-sm"
									title="Eliminar"
								>
									Eliminar
								</Button>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Modal */}
			{showModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
					<div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
						<div className="p-6 border-b border-gray-200">
							<h3 className="text-xl font-bold text-gray-800">
								{editingPeriod
									? "Editar Período"
									: "Nuevo Período de Indisponibilidad"}
							</h3>
						</div>

						<form onSubmit={handleSubmit} className="p-6 space-y-4">
							<div>
								<label
									htmlFor="start_date"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Fecha de Inicio *
								</label>
								<DatePicker
									value={
										formData.start_date ? dayjs(formData.start_date) : null
									}
									onChange={(date: Dayjs | null) =>
										setFormData({
											...formData,
											start_date: date ? date.format("YYYY-MM-DD") : "",
										})
									}
									format="DD/MM/YYYY"
									className="w-full"
									placeholder="Seleccionar fecha de inicio"
									disabledDate={(current) =>
										current && current < dayjs().startOf("day")
									}
								/>
							</div>

							<div>
								<label
									htmlFor="end_date"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Fecha de Fin (Opcional)
								</label>
								<DatePicker
									value={formData.end_date ? dayjs(formData.end_date) : null}
									onChange={(date: Dayjs | null) =>
										setFormData({
											...formData,
											end_date: date ? date.format("YYYY-MM-DD") : null,
										})
									}
									format="DD/MM/YYYY"
									className="w-full"
									placeholder="Seleccionar fecha de fin (dejar vacío para un solo día)"
									disabledDate={(current) => {
										if (!formData.start_date)
											return current && current < dayjs().startOf("day")
										return current && current < dayjs(formData.start_date)
									}}
								/>
								<p className="text-xs text-gray-500 mt-1">
									Dejar vacío para marcar solo un día específico
								</p>
							</div>

							<div>
								<label
									htmlFor="reason"
									className="block text-sm font-medium text-gray-700 mb-2"
								>
									Motivo (Opcional)
								</label>
								<TextArea
									value={formData.reason || ""}
									onChange={(e) =>
										setFormData({
											...formData,
											reason: e.target.value || null,
										})
									}
									placeholder="Ej: Vacaciones, Licencia médica, etc."
									rows={3}
									className="w-full"
								/>
							</div>

							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									id="is_active_unavailability"
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
									htmlFor="is_active_unavailability"
									className="text-sm font-medium text-gray-700"
								>
									Período activo
								</label>
							</div>

							<div className="flex gap-3 pt-4">
								<Button
									type="button"
									variant="default"
									onClick={handleCloseModal}
									className="flex-1 !border-gray-300 !text-gray-700"
								>
									Cancelar
								</Button>
								<Button type="submit" variant="primary" className="flex-1">
									{editingPeriod ? "Actualizar" : "Crear"}
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			<ConfirmModal
				isOpen={deleteConfirm.isOpen}
				onClose={() => setDeleteConfirm({ isOpen: false, period: null })}
				onConfirm={handleDelete}
				title="¿Eliminar período de indisponibilidad?"
				message={
					<p>
						¿Estás seguro de que deseas eliminar este período? Los pacientes
						podrán agendar citas en estas fechas después de eliminarlo.
					</p>
				}
				confirmText="Sí, eliminar"
				cancelText="Cancelar"
				variant="danger"
			/>
		</div>
	)
}

export default DoctorUnavailabilityManagement

import { Input, Select } from "antd"
import { useCallback, useEffect, useState } from "react"
import {
	FaClock,
	FaDollarSign,
	FaEdit,
	FaStethoscope,
	FaTrash,
} from "react-icons/fa"
import { MdAddCircleOutline, MdSearch } from "react-icons/md"
import { toast } from "react-toastify"
import type { Surgery } from "../../../shared"
import { ConfirmModal, formatPrice } from "../../../shared"
import {
	type CurrencyRates,
	getCurrencyRates,
} from "../../currency/services/CurrencyAPI"
import {
	getSettings,
	type UserSettings,
} from "../../settings/services/SettingsAPI"
import { deleteSurgeryById, getSurgeries } from "../services/SurgeriesAPI"
import SurgeryModal from "./SurgeryModal"

const SurgeriesSection = () => {
	const [surgeries, setSurgeries] = useState<Surgery[]>([])
	const [loading, setLoading] = useState(false)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [editingSurgery, setEditingSurgery] = useState<Surgery | null>(null)
	const [deleteConfirm, setDeleteConfirm] = useState<{
		isOpen: boolean
		surgery: Surgery | null
	}>({ isOpen: false, surgery: null })
	const [searchTerm, setSearchTerm] = useState("")
	const [settings, setSettings] = useState<UserSettings | null>(null)
	const [currencyRates, setCurrencyRates] = useState<CurrencyRates | null>(null)
	const [statusFilter, setStatusFilter] = useState<string>("all")
	const [dateFilter, setDateFilter] = useState<string>("all")

	const loadSurgeries = useCallback(async () => {
		setLoading(true)
		try {
			const data = await getSurgeries()
			setSurgeries(data.surgeries || [])
		} catch (error) {
			console.error("Error al cargar cirugías:", error)
			toast.error("Error al cargar las cirugías")
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		loadSurgeries()
		const loadPriceData = async () => {
			try {
				const [settingsData, ratesData] = await Promise.all([
					getSettings().catch(() => null),
					getCurrencyRates().catch(() => null),
				])
				setSettings(settingsData)
				setCurrencyRates(ratesData)
			} catch (error) {
				console.error("Error loading price data:", error)
			}
		}
		loadPriceData()
	}, [loadSurgeries])

	const handleCreateSurgery = () => {
		setEditingSurgery(null)
		setIsModalOpen(true)
	}

	const handleEditSurgery = (surgery: Surgery) => {
		setEditingSurgery(surgery)
		setIsModalOpen(true)
	}

	const handleDeleteSurgery = async () => {
		if (!deleteConfirm.surgery) return

		try {
			await deleteSurgeryById(deleteConfirm.surgery.id)
			toast.success("Cirugía eliminada con éxito")
			loadSurgeries()
			setDeleteConfirm({ isOpen: false, surgery: null })
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Error al eliminar la cirugía",
			)
		}
	}

	const getStatusBadge = (status: string) => {
		const statusConfig: Record<string, { label: string; className: string }> = {
			scheduled: {
				label: "Programada",
				className: "bg-blue-100 text-blue-700",
			},
			in_progress: {
				label: "En Progreso",
				className: "bg-orange-100 text-orange-700",
			},
			completed: {
				label: "Completada",
				className: "bg-green-100 text-green-700",
			},
			cancelled: {
				label: "Cancelada",
				className: "bg-red-100 text-red-700",
			},
			postponed: {
				label: "Aplazada",
				className: "bg-yellow-100 text-yellow-700",
			},
		}

		const config = statusConfig[status.toLowerCase()] || {
			label: status,
			className: "bg-gray-100 text-gray-700",
		}
		return (
			<span
				className={`px-3 py-1 rounded-full text-xs font-medium ${config.className}`}
			>
				{config.label}
			</span>
		)
	}

	const formatDateTime = (dateString: string) => {
		const date = new Date(dateString)
		return {
			date: date.toLocaleDateString("es-ES", {
				day: "numeric",
				month: "short",
				year: "numeric",
			}),
			time: date.toLocaleTimeString("es-ES", {
				hour: "2-digit",
				minute: "2-digit",
			}),
		}
	}

	// Filtrar cirugías
	const filteredSurgeries = surgeries.filter((surgery) => {
		// Filtro de búsqueda
		const searchLower = searchTerm.toLowerCase()
		const patientName =
			`${surgery.patient_first_name || ""} ${surgery.patient_last_name || ""}`.toLowerCase()
		const matchesSearch =
			!searchTerm ||
			patientName.includes(searchLower) ||
			surgery.doctor_name?.toLowerCase().includes(searchLower) ||
			surgery.surgery_type?.toLowerCase().includes(searchLower) ||
			surgery.notes?.toLowerCase().includes(searchLower)

		// Filtro de estado
		const matchesStatus =
			statusFilter === "all" ||
			surgery.status?.toLowerCase() === statusFilter.toLowerCase()

		// Filtro de fecha
		let matchesDate = true
		if (dateFilter !== "all") {
			const surgeryDate = new Date(surgery.surgery_date)
			const today = new Date()
			today.setHours(0, 0, 0, 0)

			switch (dateFilter) {
				case "today":
					matchesDate = surgeryDate.toDateString() === today.toDateString()
					break
				case "week": {
					const weekFromNow = new Date(today)
					weekFromNow.setDate(today.getDate() + 7)
					matchesDate = surgeryDate >= today && surgeryDate <= weekFromNow
					break
				}
				case "month": {
					const monthFromNow = new Date(today)
					monthFromNow.setMonth(today.getMonth() + 1)
					matchesDate = surgeryDate >= today && surgeryDate <= monthFromNow
					break
				}
			}
		}

		return matchesSearch && matchesStatus && matchesDate
	})

	// Calcular estadísticas
	const stats = {
		available: surgeries.filter((s) => s.status?.toLowerCase() === "scheduled")
			.length,
		scheduled: surgeries.filter((s) => s.status?.toLowerCase() === "scheduled")
			.length,
		inProgress: surgeries.filter(
			(s) => s.status?.toLowerCase() === "in_progress",
		).length,
		total: surgeries.filter(
			(s) =>
				s.status?.toLowerCase() !== "cancelled" &&
				s.status?.toLowerCase() !== "completed",
		).length,
	}

	return (
		<div className="p-6">
			<div className="mb-6 flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-800">
						Reserva de Sala de Cirugía
					</h1>
					<p className="text-gray-600 mt-2">
						Gestiona las reservas de las salas quirúrgicas
					</p>
				</div>
				<button
					type="button"
					onClick={handleCreateSurgery}
					className="bg-primary text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-primary-dark transition-colors cursor-pointer"
				>
					<MdAddCircleOutline className="w-5 h-5" />
					<span>Nueva Reserva</span>
				</button>
			</div>

			{/* Estadísticas rápidas */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
				<div className="bg-white rounded-2xl shadow-lg p-6">
					<h3 className="text-sm font-semibold text-gray-600 mb-2">
						Salas Disponibles
					</h3>
					<div className="text-center">
						<p className="text-3xl font-bold text-green-600">
							{stats.available}
						</p>
						<p className="text-gray-600 mt-2 text-sm">Programadas hoy</p>
					</div>
				</div>
				<div className="bg-white rounded-2xl shadow-lg p-6">
					<h3 className="text-sm font-semibold text-gray-600 mb-2">
						Reservas Hoy
					</h3>
					<div className="text-center">
						<p className="text-3xl font-bold text-blue-600">
							{stats.scheduled}
						</p>
						<p className="text-gray-600 mt-2 text-sm">Programadas</p>
					</div>
				</div>
				<div className="bg-white rounded-2xl shadow-lg p-6">
					<h3 className="text-sm font-semibold text-gray-600 mb-2">En Uso</h3>
					<div className="text-center">
						<p className="text-3xl font-bold text-orange-600">
							{stats.inProgress}
						</p>
						<p className="text-gray-600 mt-2 text-sm">Actualmente</p>
					</div>
				</div>
				<div className="bg-white rounded-2xl shadow-lg p-6">
					<h3 className="text-sm font-semibold text-gray-600 mb-2">
						Total Reservas
					</h3>
					<div className="text-center">
						<p className="text-3xl font-bold text-purple-600">{stats.total}</p>
						<p className="text-gray-600 mt-2 text-sm">Cirugías activas</p>
					</div>
				</div>
			</div>

			{/* Filtros y búsqueda */}
			<div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
				<div className="flex flex-wrap gap-4 items-center">
					{/* Input de Búsqueda */}
					<div className="flex-1 min-w-[200px]">
						<Input
							placeholder="Buscar por paciente, médico, tipo o notas..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className='"w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"'
							prefix={<MdSearch className="text-gray-400 w-5 h-5 mr-2" />}
							allowClear
							style={{ height: "45px", display: "flex", alignItems: "center" }}
						/>
					</div>

					{/* Select de Estado */}
					<Select
						value={statusFilter}
						onChange={(value) => setStatusFilter(value)}
						className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" // !p-0 para que AntD maneje el padding interno
						style={{ height: "45px" }}
						options={[
							{ value: "all", label: "Todos los estados" },
							{ value: "scheduled", label: "Programada" },
							{ value: "in_progress", label: "En Progreso" },
							{ value: "completed", label: "Completada" },
							{ value: "cancelled", label: "Cancelada" },
							{ value: "postponed", label: "Aplazada" },
						]}
					/>

					{/* Select de Fecha */}
					<Select
						value={dateFilter}
						onChange={(value) => setDateFilter(value)}
						className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
						style={{ height: "45px" }}
						options={[
							{ value: "all", label: "Todas las fechas" },
							{ value: "today", label: "Hoy" },
							{ value: "week", label: "Esta semana" },
							{ value: "month", label: "Este mes" },
						]}
					/>
				</div>
			</div>

			{/* Lista de cirugías */}
			<div className="bg-white rounded-2xl shadow-lg p-6">
				<h3 className="text-lg font-semibold text-gray-800 mb-4">
					Reservas Activas ({filteredSurgeries.length})
				</h3>

				{loading ? (
					<div className="text-center py-8 text-gray-500">
						Cargando cirugías...
					</div>
				) : filteredSurgeries.length === 0 ? (
					<div className="text-center py-8 text-gray-500">
						{surgeries.length === 0
							? "No hay cirugías programadas"
							: "No se encontraron cirugías con los filtros aplicados"}
					</div>
				) : (
					<div className="space-y-4">
						{filteredSurgeries.map((surgery) => {
							const { date, time } = formatDateTime(surgery.surgery_date)
							const patientName =
								`${surgery.patient_first_name || ""} ${surgery.patient_last_name || ""}`.trim()

							return (
								<div
									key={surgery.id}
									className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
								>
									<div className="flex justify-between items-center">
										<div className="flex gap-4 flex-1">
											<div className="bg-primary/10 p-3 flex items-center rounded-lg">
												<FaStethoscope className="w-6 h-6 text-primary" />
											</div>
											<div className="flex-1">
												<h4 className="font-semibold text-gray-800">
													{surgery.surgery_type || "Sin tipo especificado"}
												</h4>
												<p className="text-gray-600 text-sm mt-1">
													Paciente: {patientName || "Sin nombre"}
												</p>
												{surgery.doctor_name && (
													<p className="text-gray-600 text-sm">
														Médico: {surgery.doctor_name}
													</p>
												)}
												{surgery.notes && (
													<p className="text-gray-600 text-sm mt-1">
														{surgery.notes}
													</p>
												)}
												<div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
													<span className="flex items-center gap-1">
														<FaClock className="w-4 h-4" />
														{date} - {time}
													</span>
													{surgery.price_usd && (
														<>
															<span className="flex items-center gap-1 text-primary font-semibold">
																<FaDollarSign className="w-4 h-4" />$
																{formatPrice(surgery.price_usd)} USD
															</span>
															{(settings?.custom_exchange_rate ||
																currencyRates?.oficial?.promedio) && (
																<span className="flex items-center gap-1 text-green-600 font-semibold">
																	Bs.{" "}
																	{formatPrice(
																		surgery.price_usd *
																			(settings?.custom_exchange_rate ||
																				currencyRates?.oficial?.promedio ||
																				0),
																	)}
																</span>
															)}
														</>
													)}
												</div>
											</div>
										</div>
										<div className="flex items-center gap-3">
											{getStatusBadge(surgery.status || "scheduled")}
											<div className="flex gap-2">
												<button
													type="button"
													onClick={() => handleEditSurgery(surgery)}
													className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
													title="Editar cirugía"
												>
													<FaEdit className="w-4 h-4" />
												</button>
												<button
													type="button"
													onClick={() =>
														setDeleteConfirm({
															isOpen: true,
															surgery,
														})
													}
													className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
													title="Eliminar cirugía"
												>
													<FaTrash className="w-4 h-4" />
												</button>
											</div>
										</div>
									</div>
								</div>
							)
						})}
					</div>
				)}
			</div>

			{/* Modal de crear/editar cirugía */}
			<SurgeryModal
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false)
					setEditingSurgery(null)
				}}
				onSuccess={() => {
					loadSurgeries()
					setIsModalOpen(false)
					setEditingSurgery(null)
				}}
				editingSurgery={editingSurgery}
			/>

			{/* Modal de confirmación de eliminación */}
			<ConfirmModal
				isOpen={deleteConfirm.isOpen}
				onClose={() => setDeleteConfirm({ isOpen: false, surgery: null })}
				onConfirm={handleDeleteSurgery}
				title="Eliminar Cirugía"
				message="¿Estás seguro de que deseas eliminar esta reserva de cirugía? Esta acción no se puede deshacer."
				confirmText="Eliminar"
				cancelText="Cancelar"
				variant="danger"
			/>
		</div>
	)
}

export default SurgeriesSection

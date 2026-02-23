import { Input, Select } from "antd"
import { useCallback, useEffect, useState } from "react"
import {
	FaCalendarCheck,
	FaClock,
	FaDollarSign,
	FaEdit,
	FaTrash,
	FaUserMd,
} from "react-icons/fa"
import { MdAddCircleOutline, MdFilterList, MdSearch } from "react-icons/md"
import { toast } from "react-toastify"
import type { Appointment } from "../../../shared"
import { Button, ConfirmModal, formatPrice } from "../../../shared"
import { useAuth } from "../../auth"
import { getCurrencyRates } from "../../currency/services/CurrencyAPI"
import {
	getSettings,
	type UserSettings,
} from "../../settings/services/SettingsAPI"
import {
	deleteAppointmentById,
	getAllAppointments,
	getFilteredAppointments,
} from "../services/AppointmentsAPI"
import AppointmentModal from "./AppointmentModal"

const AppointmentsSection = () => {
	const { user } = useAuth()
	const [appointments, setAppointments] = useState<Appointment[]>([])
	const [loading, setLoading] = useState(false)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [editingAppointment, setEditingAppointment] =
		useState<Appointment | null>(null)
	const [deleteConfirm, setDeleteConfirm] = useState<{
		isOpen: boolean
		appointment: Appointment | null
	}>({ isOpen: false, appointment: null })
	const [searchTerm, setSearchTerm] = useState("")
	const [statusFilter, setStatusFilter] = useState<string>("all")
	const [dateFilter, setDateFilter] = useState<string>("all")
	const [settings, setSettings] = useState<UserSettings | null>(null)
	const [currencyRates, setCurrencyRates] = useState<any>(null)

	type AppointmentData = {
		appointments: Appointment[]
	}

	const loadAppointments = useCallback(async () => {
		setLoading(true)
		try {
			let data: AppointmentData
			if (user?.role === "Admin") {
				data = await getAllAppointments()
			} else {
				data = await getFilteredAppointments()
			}
			setAppointments(data.appointments || [])
		} catch (error) {
			console.error("Error al cargar citas:", error)
			toast.error("Error al cargar las citas")
		} finally {
			setLoading(false)
		}
	}, [user?.role])

	useEffect(() => {
		loadAppointments()
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
	}, [loadAppointments])

	const handleCreateAppointment = () => {
		setEditingAppointment(null)
		setIsModalOpen(true)
	}

	const handleEditAppointment = (appointment: Appointment) => {
		setEditingAppointment(appointment)
		setIsModalOpen(true)
	}

	const handleDeleteAppointment = async () => {
		if (!deleteConfirm.appointment) return

		try {
			await deleteAppointmentById(deleteConfirm.appointment.id)
			toast.success("Cita eliminada con éxito")
			loadAppointments()
			setDeleteConfirm({ isOpen: false, appointment: null })
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Error al eliminar la cita",
			)
		}
	}

	const getStatusBadge = (status: Appointment["status"]) => {
		const statusConfig = {
			pending: {
				label: "Pendiente",
				className: "bg-yellow-100 text-yellow-700",
			},
			scheduled: {
				label: "Programada",
				className: "bg-blue-100 text-blue-700",
			},
			cancelled: {
				label: "Cancelada",
				className: "bg-red-100 text-red-700",
			},
			completed: {
				label: "Completada",
				className: "bg-green-100 text-green-700",
			},
		}

		const config = statusConfig[status] || statusConfig.pending
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

	// Filtrar citas
	const filteredAppointments = appointments.filter((appointment) => {
		// Filtro de búsqueda
		const searchLower = searchTerm.toLowerCase()
		const matchesSearch =
			!searchTerm ||
			appointment.patient_name?.toLowerCase().includes(searchLower) ||
			appointment.doctor_name?.toLowerCase().includes(searchLower) ||
			appointment.notes?.toLowerCase().includes(searchLower)

		// Filtro de estado
		const matchesStatus =
			statusFilter === "all" || appointment.status === statusFilter

		// Filtro de fecha
		let matchesDate = true
		if (dateFilter !== "all") {
			const appointmentDate = new Date(appointment.appointment_date)
			const today = new Date()
			today.setHours(0, 0, 0, 0)

			switch (dateFilter) {
				case "today":
					matchesDate = appointmentDate.toDateString() === today.toDateString()
					break
				case "week": {
					const weekFromNow = new Date(today)
					weekFromNow.setDate(today.getDate() + 7)
					matchesDate =
						appointmentDate >= today && appointmentDate <= weekFromNow
					break
				}
				case "month": {
					const monthFromNow = new Date(today)
					monthFromNow.setMonth(today.getMonth() + 1)
					matchesDate =
						appointmentDate >= today && appointmentDate <= monthFromNow
					break
				}
			}
		}

		return matchesSearch && matchesStatus && matchesDate
	})

	const isDoctor = user?.role === "Médico"
	const isAdmin = user?.role === "Admin"

	return (
		<div className="p-6">
			<div className="mb-6 flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-800">Agendar Citas</h1>
					<p className="text-gray-600 mt-2">
						Programa y administra citas médicas
					</p>
				</div>
				<Button
					type="button"
					onClick={handleCreateAppointment}
					icon={<MdAddCircleOutline className="w-5 h-5" />}
					className="!px-6 !py-3 !rounded-lg"
				>
					Nueva Cita
				</Button>
			</div>

			{/* Filtros y búsqueda */}
			<div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
				<div className="flex flex-wrap gap-4">
					<div className="flex-1 min-w-[200px]">
						<div className="relative">
							<MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
							<Input
								placeholder={
									isDoctor ? "Buscar paciente..." : "Buscar médico o notas..."
								}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								prefix={<MdSearch className="text-gray-400" />}
								allowClear // Añade una (X) para limpiar el texto fácilmente
								size="large" // O "middle" según prefieras el grosor
								className="rounded-lg" // Puedes mantener tus clases de Tailwind para el radio
								// AntD ya maneja el focus ring y el border por defecto
							/>
						</div>
					</div>
					<div className="flex gap-4">
						{/* Filtro de Estado */}
						<Select
							value={statusFilter}
							onChange={(value) => setStatusFilter(value)}
							className="w-[200px]" // AntD usa anchos definidos o crece según el contenido
							placeholder="Seleccionar estado"
							// Estilos de Tailwind se pueden aplicar vía style o envolviendo el componente
							style={{ height: "42px" }}
							options={[
								{ value: "all", label: "Todos los estados" },
								{ value: "pending", label: "Pendiente" },
								{ value: "scheduled", label: "Programada" },
								{ value: "cancelled", label: "Cancelada" },
								{ value: "completed", label: "Completada" },
							]}
						></Select>

						{/* Filtro de Fecha */}
						<Select
							value={dateFilter}
							onChange={(value) => setDateFilter(value)}
							className="w-[200px]"
							placeholder="Filtrar por fecha"
							style={{ height: "42px" }}
							options={[
								{ value: "all", label: "Todas las fechas" },
								{ value: "today", label: "Hoy" },
								{ value: "week", label: "Esta semana" },
								{ value: "month", label: "Este mes" },
							]}
						></Select>
					</div>
				</div>
			</div>

			{/* Lista de citas */}
			<div className="bg-white rounded-2xl shadow-lg p-6">
				<h3 className="text-lg font-semibold text-gray-800 mb-4">
					Citas Programadas ({filteredAppointments.length})
				</h3>

				{loading ? (
					<div className="text-center py-8 text-gray-500">
						Cargando citas...
					</div>
				) : filteredAppointments.length === 0 ? (
					<div className="text-center py-8 text-gray-500">
						{appointments.length === 0
							? "No hay citas programadas"
							: "No se encontraron citas con los filtros aplicados"}
					</div>
				) : (
					<div className="space-y-4">
						{filteredAppointments.map((appointment) => {
							const { date, time } = formatDateTime(
								appointment.appointment_date,
							)
							const displayName =
								isDoctor || isAdmin
									? appointment.patient_name
									: appointment.doctor_name

							return (
								<div
									key={appointment.id}
									className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
								>
									<div className="flex justify-between items-center">
										<div className="flex gap-4 flex-1">
											<div className="bg-primary/10 flex items-center p-3 rounded-lg">
												<FaCalendarCheck className="w-6 h-6 text-primary" />
											</div>
											<div className="flex-1">
												<h4 className="font-semibold text-gray-800">
													{displayName || "Sin nombre"}
												</h4>
												{appointment.notes && (
													<p className="text-gray-600 text-sm mt-1">
														{appointment.notes}
													</p>
												)}
												<div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
													<span className="flex items-center gap-1">
														<FaClock className="w-4 h-4" />
														{date} - {time}
													</span>
													{isDoctor && appointment.patient_name && (
														<span className="flex items-center gap-1">
															<FaUserMd className="w-4 h-4" />
															{appointment.patient_name}
														</span>
													)}
													{appointment.price_usd && (
														<>
															<span className="flex items-center gap-1 text-primary font-semibold">
																<FaDollarSign className="w-4 h-4" />$
																{formatPrice(appointment.price_usd)} USD
															</span>
															{(settings?.custom_exchange_rate ||
																currencyRates?.oficial?.promedio) && (
																<span className="flex items-center gap-1 text-green-600 font-semibold">
																	Bs.{" "}
																	{formatPrice(
																		appointment.price_usd *
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
											{getStatusBadge(appointment.status)}
											<div className="flex gap-2">
												<Button
													type="button"
													variant="text"
													onClick={() => handleEditAppointment(appointment)}
													icon={<FaEdit className="w-4 h-4" />}
													className="!p-2 text-primary hover:!bg-primary/10 !min-w-0"
													title="Editar cita"
												/>
												{(isDoctor || isAdmin) && (
													<Button
														type="button"
														variant="text"
														danger
														onClick={() =>
															setDeleteConfirm({
																isOpen: true,
																appointment,
															})
														}
														icon={<FaTrash className="w-4 h-4" />}
														className="!p-2 !min-w-0 hover:!bg-red-50"
														title="Eliminar cita"
													/>
												)}
											</div>
										</div>
									</div>
								</div>
							)
						})}
					</div>
				)}
			</div>

			{/* Modal de crear/editar cita */}
			<AppointmentModal
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false)
					setEditingAppointment(null)
				}}
				onSuccess={() => {
					loadAppointments()
					setIsModalOpen(false)
					setEditingAppointment(null)
				}}
				editingAppointment={editingAppointment}
			/>

			{/* Modal de confirmación de eliminación */}
			<ConfirmModal
				isOpen={deleteConfirm.isOpen}
				onClose={() => setDeleteConfirm({ isOpen: false, appointment: null })}
				onConfirm={handleDeleteAppointment}
				title="Eliminar Cita"
				message="¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer."
				confirmText="Eliminar"
				cancelText="Cancelar"
				variant="danger"
			/>
		</div>
	)
}

export default AppointmentsSection

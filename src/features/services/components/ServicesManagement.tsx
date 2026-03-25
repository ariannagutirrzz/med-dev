import { useCallback, useEffect, useState } from "react"
import {
	FaDollarSign,
	FaEdit,
	FaPlus,
	FaSave,
	FaTimes,
	FaTrash,
} from "react-icons/fa"
import { toast } from "react-toastify"
import { Button, formatPrice } from "../../../shared"
import LoadingSpinner from "../../../shared/components/common/LoadingSpinner"
import { getCurrencyRates } from "../../currency/services/CurrencyAPI"
import {
	getSettings,
	type UserSettings,
} from "../../settings/services/SettingsAPI"
import {
	type CreateDoctorServiceInput,
	createService,
	type DoctorServiceWithType,
	deleteService,
	getMyServices,
	updateService,
} from "../services/ServicesAPI"

const ServicesManagement: React.FC = () => {
	const [services, setServices] = useState<DoctorServiceWithType[]>([])
	const [settings, setSettings] = useState<UserSettings | null>(null)
	const [currencyRates, setCurrencyRates] = useState<any>(null)
	const [loading, setLoading] = useState(true)
	const [showModal, setShowModal] = useState(false)
	const [editingService, setEditingService] =
		useState<DoctorServiceWithType | null>(null)
	const [formData, setFormData] = useState({
		service_name: "",
		price_usd: "",
		is_active: true,
	})

	const loadData = useCallback(async () => {
		try {
			setLoading(true)
			const [servicesData, settingsData, ratesData] = await Promise.all([
				getMyServices(),
				getSettings(),
				getCurrencyRates().catch(() => null),
			])
			setServices(servicesData)
			setSettings(settingsData)
			setCurrencyRates(ratesData)
		} catch (error) {
			console.error("Error loading data:", error)
			toast.error("Error al cargar los servicios")
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		loadData()
	}, [loadData])

	const handleOpenModal = (service?: DoctorServiceWithType) => {
		if (service) {
			setEditingService(service)
			setFormData({
				service_name: service.service_type.name,
				price_usd: service.price_usd.toString(),
				is_active: service.is_active,
			})
		} else {
			setEditingService(null)
			setFormData({
				service_name: "",
				price_usd: "",
				is_active: true,
			})
		}
		setShowModal(true)
	}

	const handleCloseModal = () => {
		setShowModal(false)
		setEditingService(null)
		setFormData({
			service_name: "",
			price_usd: "",
			is_active: true,
		})
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			if (editingService) {
				await updateService(editingService.id, {
					price_usd: parseFloat(formData.price_usd),
					is_active: formData.is_active,
				})
				toast.success("Servicio actualizado exitosamente")
			} else {
				if (!formData.service_name.trim()) {
					toast.error("El nombre del servicio es requerido")
					return
				}
				await createService({
					service_name: formData.service_name.trim(),
					price_usd: parseFloat(formData.price_usd),
					is_active: formData.is_active,
				})
				toast.success("Servicio creado exitosamente")
			}
			handleCloseModal()
			loadData()
		} catch (error) {
			console.error("Error saving service:", error)
			toast.error(
				error instanceof Error ? error.message : "Error al guardar el servicio",
			)
		}
	}

	const handleDelete = async (id: number) => {
		if (
			!window.confirm("¿Estás seguro de que deseas eliminar este servicio?")
		) {
			return
		}
		try {
			await deleteService(id)
			toast.success("Servicio eliminado exitosamente")
			loadData()
		} catch (error) {
			console.error("Error deleting service:", error)
			toast.error("Error al eliminar el servicio")
		}
	}

	const getPriceInBS = (priceUsd: number): number => {
		const exchangeRate =
			settings?.custom_exchange_rate || currencyRates?.oficial?.promedio || 0
		return priceUsd * exchangeRate
	}

	if (loading) {
		return (
			<LoadingSpinner
				className="min-h-screen"
				loadingMessage="CARGANDO SERVICIOS..."
			/>
		)
	}

	return (
		<div className="p-6">
			<div className="mb-4 flex justify-between items-center">
				<div>
					<h1 className="text-2xl font-bold text-gray-800">
						Gestión de Servicios
					</h1>
					<p className="text-sm text-gray-600 mt-1">
						Administra tus servicios y precios
					</p>
				</div>
				<Button
					type="button"
					size="middle"
					onClick={() => handleOpenModal()}
					icon={<FaPlus className="w-4 h-4" />}
					className="!min-h-0 !px-3 !py-2 !rounded-lg !text-sm"
				>
					Agregar Servicio
				</Button>
			</div>

			{/* Services List */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
				{services.map((service) => {
					const priceBS = getPriceInBS(service.price_usd)
					const exchangeRate =
						settings?.custom_exchange_rate ||
						currencyRates?.oficial?.promedio ||
						0

					return (
						<div
							key={service.id}
							className={`bg-white rounded-lg border border-gray-200 shadow p-4 ${
								!service.is_active ? "opacity-60" : ""
							}`}
						>
							<div className="flex justify-between items-start mb-3">
								<div>
									<h3 className="text-base font-semibold text-gray-800">
										{service.service_type.name}
									</h3>
									{service.service_type.description && (
										<p className="text-xs text-gray-600 mt-0.5">
											{service.service_type.description}
										</p>
									)}
								</div>
								{!service.is_active && (
									<span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded">
										Inactivo
									</span>
								)}
							</div>

							<div className="space-y-1.5 mb-3">
								<div className="flex items-center justify-between text-sm">
									<span className="text-gray-600">Precio USD:</span>
									<span className="font-semibold text-primary">
										${formatPrice(service.price_usd)}
									</span>
								</div>
								{exchangeRate > 0 && (
									<div className="flex items-center justify-between text-sm">
										<span className="text-gray-600">Precio BS:</span>
										<span className="font-semibold text-green-600">
											Bs. {formatPrice(priceBS)}
										</span>
									</div>
								)}
								{exchangeRate > 0 && (
									<div className="text-xs text-gray-500 pt-1.5 border-t border-gray-100">
										Tasa: {formatPrice(exchangeRate)} Bs/$
									</div>
								)}
							</div>

							<div className="flex gap-2">
								<Button
									type="button"
									size="middle"
									onClick={() => handleOpenModal(service)}
									icon={<FaEdit className="w-3.5 h-3.5" />}
									className="flex-1 !min-h-0 !px-2 !py-1.5 !rounded-lg !text-sm bg-blue-500 border-0 text-white hover:!bg-blue-600"
								>
									Editar
								</Button>
								<Button
									type="button"
									size="middle"
									variant="default"
									onClick={() => handleDelete(service.id)}
									icon={<FaTrash className="w-3.5 h-3.5" />}
									className="flex-1 !min-h-0 !px-2 !py-1.5 !rounded-lg !text-sm !text-red-700 !border-red-300 bg-white hover:!bg-red-50"
								>
									Eliminar
								</Button>
							</div>
						</div>
					)
				})}
			</div>

			{services.length === 0 && (
				<div className="text-center py-8 bg-white rounded-lg border border-gray-200">
					<FaDollarSign className="text-4xl text-gray-300 mx-auto mb-3" />
					<p className="text-gray-600 text-base">
						No tienes servicios configurados
					</p>
					<p className="text-gray-500 text-sm mt-1">
						Agrega tu primer servicio para comenzar
					</p>
				</div>
			)}

			{/* Modal */}
			{showModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 w-full bg-black/90 backdrop-blur-sm">
					<div className="bg-gray-100 w-full my-auto max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
						{/* Header */}
						<div className="p-6 pb-0 flex justify-between items-center">
							<h2 className="text-xl font-bold text-gray-800">
								{editingService ? "Editar Servicio" : "Nuevo Servicio"}
							</h2>
							<Button
								type="button"
								variant="text"
								onClick={handleCloseModal}
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
								{/* Nombre del Servicio */}
								{!editingService ? (
									<div className="flex flex-col">
										<label
											htmlFor="service_name"
											className="text-xs font-bold text-gray-700 mb-1 block ml-1"
										>
											Nombre del Tratamiento/Servicio *
										</label>
										<input
											id="service_name"
											type="text"
											value={formData.service_name}
											onChange={(e) =>
												setFormData({
													...formData,
													service_name: e.target.value,
												})
											}
											className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-700 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
											placeholder="Ej: Consulta, Toracoscopia..."
											required
										/>
										<p className="text-xs text-gray-400 mt-1 ml-1">
											Nombre del tratamiento o servicio
										</p>
									</div>
								) : (
									<div className="flex flex-col">
										<label
											htmlFor="service_name_disabled"
											className="text-xs font-bold text-gray-700 mb-1 block ml-1"
										>
											Nombre del Servicio
										</label>
										<input
											id="service_name_disabled"
											type="text"
											value={formData.service_name}
											disabled
											className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-500 outline-none opacity-60"
										/>
										<p className="text-xs text-gray-400 mt-1 ml-1">
											El nombre no se puede modificar
										</p>
									</div>
								)}

								{/* Precio */}
								<div className="flex flex-col">
									<label
										htmlFor="price_usd"
										className="text-xs font-bold text-gray-700 mb-1 block ml-1"
									>
										Precio (USD)
									</label>
									<input
										id="price_usd"
										type="number"
										step="0.01"
										min="0"
										value={formData.price_usd}
										onChange={(e) =>
											setFormData({ ...formData, price_usd: e.target.value })
										}
										className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-700 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none"
										required
									/>
								</div>

								{/* Activo */}
								<div className="flex items-center gap-3">
									<input
										type="checkbox"
										id="is_active"
										checked={formData.is_active}
										onChange={(e) =>
											setFormData({ ...formData, is_active: e.target.checked })
										}
										className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
									/>
									<label
										htmlFor="is_active"
										className="text-sm font-bold text-gray-700 cursor-pointer"
									>
										Servicio activo
									</label>
								</div>
							</div>

							{/* Botones de Acción */}
							<div className="flex gap-3 pt-2">
								<Button
									type="button"
									variant="default"
									onClick={handleCloseModal}
									className="flex-1 py-3! border-2 border-gray-300 text-gray-700 font-bold rounded-2xl"
								>
									Cancelar
								</Button>
								<Button
									type="submit"
									icon={<FaSave />}
									className="flex-1 py-3! font-bold rounded-2xl"
								>
									{editingService ? "Actualizar" : "Crear"} Servicio
								</Button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}

export default ServicesManagement

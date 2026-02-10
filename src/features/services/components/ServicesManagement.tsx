import { useCallback, useEffect, useState } from "react"
import { toast } from "react-toastify"
import { FaPlus, FaEdit, FaTrash, FaDollarSign } from "react-icons/fa"
import {
	createService,
	deleteService,
	getMyServices,
	updateService,
	type CreateDoctorServiceInput,
	type DoctorServiceWithType,
} from "../services/ServicesAPI"
import { getSettings, type UserSettings } from "../../settings/services/SettingsAPI"
import { getCurrencyRates } from "../../currency/services/CurrencyAPI"
import { formatPrice } from "../../../shared"

const ServicesManagement: React.FC = () => {
	const [services, setServices] = useState<DoctorServiceWithType[]>([])
	const [settings, setSettings] = useState<UserSettings | null>(null)
	const [currencyRates, setCurrencyRates] = useState<any>(null)
	const [loading, setLoading] = useState(true)
	const [showModal, setShowModal] = useState(false)
	const [editingService, setEditingService] = useState<DoctorServiceWithType | null>(null)
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
		if (!window.confirm("¿Estás seguro de que deseas eliminar este servicio?")) {
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
			settings?.custom_exchange_rate ||
			currencyRates?.oficial?.promedio ||
			0
		return priceUsd * exchangeRate
	}


	if (loading) {
		return (
			<div className="p-6">
				<div className="animate-pulse">Cargando servicios...</div>
			</div>
		)
	}

	return (
		<div className="p-6">
			<div className="mb-6 flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-800">Gestión de Servicios</h1>
					<p className="text-gray-600 mt-2">
						Administra tus servicios y precios
					</p>
				</div>
				<button
					type="button"
					onClick={() => handleOpenModal()}
					className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center gap-2 cursor-pointer"
				>
					<FaPlus /> Agregar Servicio
				</button>
			</div>

			{/* Services List */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{services.map((service) => {
					const priceBS = getPriceInBS(service.price_usd)
					const exchangeRate =
						settings?.custom_exchange_rate ||
						currencyRates?.oficial?.promedio ||
						0

					return (
						<div
							key={service.id}
							className={`bg-white rounded-xl shadow-lg p-6 ${
								!service.is_active ? "opacity-60" : ""
							}`}
						>
							<div className="flex justify-between items-start mb-4">
								<div>
									<h3 className="text-lg font-semibold text-gray-800">
										{service.service_type.name}
									</h3>
									{service.service_type.description && (
										<p className="text-sm text-gray-600 mt-1">
											{service.service_type.description}
										</p>
									)}
								</div>
								{!service.is_active && (
									<span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded">
										Inactivo
									</span>
								)}
							</div>

							<div className="space-y-2 mb-4">
								<div className="flex items-center justify-between">
									<span className="text-gray-600">Precio USD:</span>
									<span className="font-semibold text-primary">
										${formatPrice(service.price_usd)}
									</span>
								</div>
								{exchangeRate > 0 && (
									<div className="flex items-center justify-between">
										<span className="text-gray-600">Precio BS:</span>
										<span className="font-semibold text-green-600">
											Bs. {formatPrice(priceBS)}
										</span>
									</div>
								)}
								{exchangeRate > 0 && (
									<div className="text-xs text-gray-500 pt-2 border-t">
										Tasa: {formatPrice(exchangeRate)} Bs/$
									</div>
								)}
							</div>

							<div className="flex gap-2">
								<button
									type="button"
									onClick={() => handleOpenModal(service)}
									className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 cursor-pointer"
								>
									<FaEdit /> Editar
								</button>
								<button
									type="button"
									onClick={() => handleDelete(service.id)}
									className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 cursor-pointer"
								>
									<FaTrash /> Eliminar
								</button>
							</div>
						</div>
					)
				})}
			</div>

			{services.length === 0 && (
				<div className="text-center py-12 bg-white rounded-xl shadow-lg">
					<FaDollarSign className="text-6xl text-gray-300 mx-auto mb-4" />
					<p className="text-gray-600 text-lg">No tienes servicios configurados</p>
					<p className="text-gray-500 text-sm mt-2">
						Agrega tu primer servicio para comenzar
					</p>
				</div>
			)}

			{/* Modal */}
			{showModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
						<h2 className="text-2xl font-bold text-gray-800 mb-4">
							{editingService ? "Editar Servicio" : "Nuevo Servicio"}
						</h2>

						<form onSubmit={handleSubmit} className="space-y-4">
							{!editingService && (
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Nombre del Tratamiento/Servicio *
									</label>
									<input
										type="text"
										value={formData.service_name}
										onChange={(e) =>
											setFormData({ ...formData, service_name: e.target.value })
										}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
										placeholder="Ej: Consulta, Toracoscopia, Biopsia de pleura..."
										required
									/>
									<p className="text-xs text-gray-500 mt-1">
										Escribe el nombre del tratamiento o servicio que deseas agregar
									</p>
								</div>
							)}
							{editingService && (
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Nombre del Servicio
									</label>
									<input
										type="text"
										value={formData.service_name}
										disabled
										className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
									/>
									<p className="text-xs text-gray-500 mt-1">
										El nombre del servicio no se puede modificar
									</p>
								</div>
							)}

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Precio (USD)
								</label>
								<input
									type="number"
									step="0.01"
									min="0"
									value={formData.price_usd}
									onChange={(e) =>
										setFormData({ ...formData, price_usd: e.target.value })
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
									required
								/>
							</div>

							<div className="flex items-center">
								<input
									type="checkbox"
									id="is_active"
									checked={formData.is_active}
									onChange={(e) =>
										setFormData({ ...formData, is_active: e.target.checked })
									}
									className="mr-2"
								/>
								<label htmlFor="is_active" className="text-sm text-gray-700">
									Servicio activo
								</label>
							</div>

							<div className="flex gap-3 pt-4">
								<button
									type="button"
									onClick={handleCloseModal}
									className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 cursor-pointer"
								>
									Cancelar
								</button>
								<button
									type="submit"
									className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark cursor-pointer"
								>
									{editingService ? "Actualizar" : "Crear"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	)
}

export default ServicesManagement

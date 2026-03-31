import type React from "react"
import { FaEdit, FaTrash, FaUserMd } from "react-icons/fa"
import { Button, formatPrice } from "../../../shared"
import { useAuth } from "../../auth"
import type { DoctorServiceWithType } from "../services/ServicesAPI"

interface ServicesListProps {
	services: DoctorServiceWithType[]
	exchangeRate: number
	onEdit?: (service: DoctorServiceWithType) => void
	onDelete?: (id: number) => void
}

interface GroupedServices {
	[doctor_id: string]: DoctorServiceWithType[]
}

const ServicesList: React.FC<ServicesListProps> = ({
	services,
	exchangeRate,
	onEdit,
	onDelete,
}) => {
	const { user } = useAuth()
	const isAdmin = user?.role?.toLowerCase() === "admin"

	// Agrupación para el administrador
	const getGroupedServices = (): GroupedServices => {
		return services.reduce((acc: GroupedServices, service) => {
			const key = service.doctor_id
			if (!acc[key]) acc[key] = []
			acc[key].push(service)
			return acc
		}, {})
	}

	// Renderizado de una tarjeta individual
	const renderServiceCard = (service: DoctorServiceWithType) => {
		const priceBS = service.price_usd * exchangeRate

		return (
			<div
				key={service.id}
				className={`bg-white rounded-lg border border-gray-200 shadow p-4 transition-all hover:shadow-md ${
					!service.is_active ? "opacity-60" : ""
				}`}
			>
				<div className="flex justify-between items-start mb-3">
					<div>
						<h3 className="text-base font-semibold text-gray-800">
							{service.service_type.name}
						</h3>
						{service.service_type.description && (
							<p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
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
						<>
							<div className="flex items-center justify-between text-sm">
								<span className="text-gray-600">Precio BS:</span>
								<span className="font-semibold text-green-600">
									Bs. {formatPrice(priceBS)}
								</span>
							</div>
							<div className="text-xs text-gray-500 pt-1.5 border-t border-gray-100">
								Tasa: {formatPrice(exchangeRate)} Bs/$
							</div>
						</>
					)}
				</div>

				{/* Botones de acción (solo se renderizan si pasamos las funciones) */}
				{(onEdit || onDelete) && (
					<div className="flex gap-2 pt-2 border-t border-gray-50 mt-2">
						{onEdit && (
							<Button
								type="button"
								size="middle"
								onClick={() => onEdit(service)}
								icon={<FaEdit className="w-3.5 h-3.5" />}
								className="flex-1 min-h-0! px-2! py-1.5! rounded-lg! text-sm! border-0 text-white bg-primary hover:bg-primary-dark"
							>
								Editar
							</Button>
						)}
						{onDelete && (
							<Button
								type="button"
								size="middle"
								variant="default"
								onClick={() => onDelete(service.id)}
								icon={<FaTrash className="w-3.5 h-3.5" />}
								className="flex-1 !min-h-0 !px-2 !py-1.5 !rounded-lg !text-sm !text-red-700 !border-red-300 bg-white hover:!bg-red-50"
							>
								Eliminar
							</Button>
						)}
					</div>
				)}
			</div>
		)
	}

	// Vista de Administrador (Agrupada)
	if (isAdmin) {
		const grouped = getGroupedServices()

		return (
			<div className="space-y-8">
				{Object.entries(grouped).map(([docId, docServices]) => (
					<div key={docId} className="space-y-4">
						{/* Header del Grupo: Icono + Nombre + Cantidad */}
						<div className="flex items-center gap-3 border-b border-gray-200 pb-2">
							{/* Icono con centrado garantizado */}
							<div className="flex items-center justify-center text-primary">
								<FaUserMd className="text-xl" />
							</div>

							{/* Nombre del Doctor: Ajustamos el leading para que no empuje el texto */}
							<div className="flex items-center min-h-8">
								{" "}
								{/* h-8 para coincidir con el icono */}
								<h2 className="text-lg font-bold text-gray-700 leading-none">
									<span className="text-primary block transform translate-y-1">
										{" "}
										{/* Pequeño ajuste manual */}
										{docServices[0]?.doctor_name}
									</span>
								</h2>
							</div>

							{/* Badge de cantidad: Usamos inline-flex para centrar el texto internamente */}
							<span className="inline-flex items-center bg-gray-100 text-gray-600 text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-gray-200">
								{docServices.length} servicios
							</span>
						</div>

						{/* Grid de servicios */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
							{docServices.map(renderServiceCard)}
						</div>
					</div>
				))}
			</div>
		)
	}

	// Vista estándar (Médico individual)
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
			{services.map(renderServiceCard)}
		</div>
	)
}

export default ServicesList

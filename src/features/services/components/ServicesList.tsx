import { useEffect, useState } from "react"
import { FaDollarSign } from "react-icons/fa"
import { getDoctorServices, type DoctorServiceWithType } from "../services/ServicesAPI"
import { getSettings, type UserSettings } from "../../settings/services/SettingsAPI"
import { getCurrencyRates } from "../../currency/services/CurrencyAPI"
import { formatPrice } from "../../../shared"

interface ServicesListProps {
	doctorId: string
}

const ServicesList: React.FC<ServicesListProps> = ({ doctorId }) => {
	const [services, setServices] = useState<DoctorServiceWithType[]>([])
	const [settings, setSettings] = useState<UserSettings | null>(null)
	const [currencyRates, setCurrencyRates] = useState<any>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const loadData = async () => {
			try {
				setLoading(true)
				const [servicesData, settingsData, ratesData] = await Promise.all([
					getDoctorServices(doctorId),
					getSettings().catch(() => null),
					getCurrencyRates().catch(() => null),
				])
				setServices(servicesData)
				setSettings(settingsData)
				setCurrencyRates(ratesData)
			} catch (error) {
				console.error("Error loading services:", error)
			} finally {
				setLoading(false)
			}
		}

		loadData()
	}, [doctorId])

	const getPriceInBS = (priceUsd: number): number => {
		const exchangeRate =
			settings?.custom_exchange_rate ||
			currencyRates?.oficial?.promedio ||
			0
		return priceUsd * exchangeRate
	}

	if (loading) {
		return (
			<div className="p-4">
				<div className="animate-pulse text-gray-500">Cargando servicios...</div>
			</div>
		)
	}

	if (services.length === 0) {
		return (
			<div className="p-4 text-center text-gray-500">
				<FaDollarSign className="text-4xl text-gray-300 mx-auto mb-2" />
				<p>No hay servicios disponibles</p>
			</div>
		)
	}

	return (
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
						className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
					>
						<h3 className="text-lg font-semibold text-gray-800 mb-2">
							{service.service_type.name}
						</h3>
						{service.service_type.description && (
							<p className="text-sm text-gray-600 mb-4">
								{service.service_type.description}
							</p>
						)}

						<div className="space-y-2">
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
						</div>
					</div>
				)
			})}
		</div>
	)
}

export default ServicesList

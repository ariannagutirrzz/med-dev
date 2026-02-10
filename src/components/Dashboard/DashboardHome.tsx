import { useCallback, useEffect, useState } from "react"
import { FaCalendarCheck, FaUserInjured, FaStethoscope } from "react-icons/fa"
import { toast } from "react-toastify"
import { useAuth } from "../../contexts/AuthContext"
import { getAppointments } from "../../services/AppointmentsAPI"
import { getCurrencyRates, type CurrencyRates } from "../../services/CurrencyAPI"
import {
	getSettings,
	updateSettings,
	type UserSettings,
} from "../../services/SettingsAPI"
import { getPatients } from "../../services/PatientsAPI"
import { getSurgeries } from "../../services/SurgeriesAPI"
import type { Appointment, Surgery } from "../../types"
import Calendar from "../Calendar"
import CalendarLegend from "../CalendarLegend"
import DashboardHeader from "../DashboardHeader"

interface DashboardStats {
	appointmentsToday: number
	totalAppointments: number
	activePatients: number
	totalSurgeries: number
	surgeriesToday: number
}

const DashboardHome = () => {
	const { user } = useAuth()
	const [loading, setLoading] = useState(true)
	const [settings, setSettings] = useState<UserSettings | null>(null)
	const [currencyRates, setCurrencyRates] = useState<CurrencyRates | null>(
		null,
	)
	const [loadingCurrency, setLoadingCurrency] = useState(true)
	const [savingCustomRate, setSavingCustomRate] = useState(false)
	const [customRateInput, setCustomRateInput] = useState("")
	const [stats, setStats] = useState<DashboardStats>({
		appointmentsToday: 0,
		totalAppointments: 0,
		activePatients: 0,
		totalSurgeries: 0,
		surgeriesToday: 0,
	})
	const [surgeries, setSurgeries] = useState<Surgery[]>([])
	const [currentDate] = useState(new Date())

	const loadDashboardData = useCallback(async () => {
		setLoading(true)
		try {
			const today = new Date()
			today.setHours(0, 0, 0, 0)
			const tomorrow = new Date(today)
			tomorrow.setDate(tomorrow.getDate() + 1)

			// Cargar citas
			let appointmentsData: { appointments?: Appointment[] } = { appointments: [] }
			try {
				appointmentsData = await getAppointments()
			} catch (error) {
				console.error("Error cargando citas:", error)
				// Si el usuario no tiene acceso, simplemente no cargamos las citas
			}

			const appointments = appointmentsData.appointments || []
			const appointmentsToday = appointments.filter((apt) => {
				const aptDate = new Date(apt.appointment_date)
				return aptDate >= today && aptDate < tomorrow
			}).length

			// Cargar pacientes (solo si es médico)
			let patientsCount = 0
			if (user?.role === "Médico") {
				try {
					const patientsData = await getPatients()
					patientsCount = patientsData?.patients?.length || 0
				} catch (error) {
					console.error("Error cargando pacientes:", error)
				}
			}

			// Cargar cirugías (solo si es médico)
			let surgeriesData: { surgeries?: Surgery[] } = { surgeries: [] }
			if (user?.role === "Médico") {
				try {
					surgeriesData = await getSurgeries()
				} catch (error) {
					console.error("Error cargando cirugías:", error)
				}
			}

			const allSurgeries = surgeriesData.surgeries || []
			const surgeriesToday = allSurgeries.filter((surgery) => {
				const surgeryDate = new Date(surgery.surgery_date)
				return surgeryDate >= today && surgeryDate < tomorrow
			}).length

			// Convertir cirugías al formato del calendario
			const calendarSurgeries = allSurgeries
				.map((surgery) => {
					const surgeryDate = new Date(surgery.surgery_date)
					// Solo incluir cirugías del mes actual
					if (
						surgeryDate.getMonth() === currentDate.getMonth() &&
						surgeryDate.getFullYear() === currentDate.getFullYear()
					) {
						// Mapear tipos de cirugía a los tipos permitidos del calendario
						let mappedType: "Cirugía Mayor" | "Cirugía Menor" | "Cirugía Programada" =
							"Cirugía Programada"
						
						if (surgery.surgery_type?.includes("Mayor") || surgery.surgery_type?.includes("mayor")) {
							mappedType = "Cirugía Mayor"
						} else if (surgery.surgery_type?.includes("Menor") || surgery.surgery_type?.includes("menor")) {
							mappedType = "Cirugía Menor"
						} else {
							mappedType = "Cirugía Programada"
						}

						return {
							day: surgeryDate.getDate(),
							type: mappedType,
						}
					}
					return null
				})
				.filter((s): s is { day: number; type: "Cirugía Mayor" | "Cirugía Menor" | "Cirugía Programada" } => s !== null)

			setStats({
				appointmentsToday,
				totalAppointments: appointments.length,
				activePatients: patientsCount,
				totalSurgeries: allSurgeries.length,
				surgeriesToday,
			})
			setSurgeries(calendarSurgeries)
		} catch (error) {
			console.error("Error cargando datos del dashboard:", error)
			toast.error("Error al cargar los datos del dashboard")
		} finally {
			setLoading(false)
		}
	}, [user?.role, currentDate])

	useEffect(() => {
		loadDashboardData()
	}, [loadDashboardData])

	// Fetch currency rates y settings del usuario (para tasa personalizada)
	useEffect(() => {
		const fetchCurrencyRates = async () => {
			try {
				setLoadingCurrency(true)
				const [rates, userSettings] = await Promise.all([
					getCurrencyRates(),
					getSettings(),
				])

				setCurrencyRates(rates)
				setSettings(userSettings)

				if (
					userSettings.custom_exchange_rate != null &&
					typeof userSettings.custom_exchange_rate === "number"
				) {
					setCustomRateInput(userSettings.custom_exchange_rate.toString())
				}
			} catch (error) {
				console.error("Error fetching currency rates:", error)
				toast.error("Error al cargar las tasas de cambio")
			} finally {
				setLoadingCurrency(false)
			}
		}

		fetchCurrencyRates()
		// Refresh every 5 minutes
		const interval = setInterval(fetchCurrencyRates, 5 * 60 * 1000)

		return () => clearInterval(interval)
	}, [])

	// Handler para guardar la tasa personalizada
	const handleSaveCustomRate = async () => {
		if (!customRateInput || isNaN(parseFloat(customRateInput))) {
			toast.error("Por favor ingresa un valor numérico válido")
			return
		}

		const rateValue = parseFloat(customRateInput)
		if (rateValue <= 0) {
			toast.error("La tasa debe ser mayor a 0")
			return
		}

		// Verificar que el usuario esté autenticado
		const token = localStorage.getItem("AUTH_TOKEN")
		if (!token) {
			toast.error("Sesión expirada. Por favor inicia sesión nuevamente.")
			return
		}

		try {
			setSavingCustomRate(true)
			const updatedSettings = await updateSettings({
				custom_exchange_rate: rateValue,
			})
			setSettings(updatedSettings)
			
			// Disparar evento personalizado para actualizar el header
			window.dispatchEvent(new CustomEvent("settingsUpdated", { 
				detail: { custom_exchange_rate: rateValue } 
			}))
			
			toast.success("Tasa personalizada guardada exitosamente")
		} catch (error) {
			console.error("Error saving custom rate:", error)
			const errorMessage =
				error instanceof Error ? error.message : "Error al guardar la tasa personalizada"
			toast.error(errorMessage)
			
			// Si es un error 401, podría ser que el token expiró
			if (errorMessage.includes("401") || errorMessage.includes("No Autorizado")) {
				toast.error("Tu sesión ha expirado. Por favor inicia sesión nuevamente.")
			}
		} finally {
			setSavingCustomRate(false)
		}
	}

	return (
		<div className="p-4 sm:p-6">
			<DashboardHeader />

			{/* Grid principal - Responsive */}
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 mt-4 sm:mt-6">
				{/* Bienvenida - Ocupa 2 columnas en desktop */}
				<div className="lg:col-span-2 mb-4 sm:mb-6">
					<h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800">
						Bienvenida, {user?.name || "Usuario"}! con que te gustaría{" "}
						<b className="text-primary">comenzar</b> hoy?
					</h1>
					<p className="mt-2 sm:mt-4 text-base sm:text-lg text-gray-400 font-semibold">
						Despliega y familiarizate con cada una de las siguientes opciones, te
						ayudaremos a gestionar de manera más eficiente, fácil y rápida.
					</p>
				</div>

				{/* Citas Hoy - Card responsive */}
				<div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
					<h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
						<FaCalendarCheck className="text-primary" />
						Citas Hoy
					</h3>
					{loading ? (
						<div className="animate-pulse">
							<div className="h-8 bg-gray-200 rounded w-16 mx-auto"></div>
						</div>
					) : (
						<div className="text-center">
							<p className="text-2xl sm:text-3xl font-bold text-green-600">
								{stats.appointmentsToday}
							</p>
							<p className="text-gray-600 mt-2 text-sm sm:text-base">
								Citas programadas
							</p>
						</div>
					)}
				</div>

				{/* Sistema Cambiario - Card responsive */}
				<div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 min-h-[220px] sm:min-h-[260px] flex flex-col">
					<div className="flex flex-row justify-between items-center mb-3 sm:mb-4">
						<h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800">
							Sistema Cambiario
						</h3>
						<img
							src="/src/assets/logo.png"
							alt="Logo del banco central de venezuela"
							className="h-7 w-7 sm:h-9 sm:w-9"
						/>
					</div>
					<div className="flex-1 flex flex-col gap-2 sm:gap-3">
						{loadingCurrency ? (
							<div className="flex items-center justify-center flex-1">
								<div className="animate-pulse text-gray-400 text-sm">
									Cargando tasas...
								</div>
							</div>
						) : currencyRates ? (
							<>
								<div className="flex flex-row justify-between text-sm sm:text-base font-semibold text-gray-400 px-2 sm:px-4">
									<span>{currencyRates.oficial.nombre}</span>
									<span>{currencyRates.oficial.promedio.toFixed(2)}</span>
								</div>
								<div className="flex flex-row justify-between text-sm sm:text-base font-semibold text-gray-400 px-2 sm:px-4">
									<span>{currencyRates.paralelo.nombre}</span>
									<span>{currencyRates.paralelo.promedio.toFixed(2)}</span>
								</div>

								{/* Configuración de tasa personalizada por médico */}
								{user?.role === "Médico" && (
									<div className="mt-3 pt-3 border-t border-gray-100 text-xs sm:text-sm text-gray-500">
										<p className="mb-2">
											Tu tasa personalizada actual:{" "}
											<span className="font-semibold text-primary">
												{settings?.custom_exchange_rate != null &&
												typeof settings.custom_exchange_rate === "number"
													? `${Number(settings.custom_exchange_rate).toFixed(2)} Bs`
													: "No definida"}
											</span>
										</p>
										<div className="flex flex-col sm:flex-row gap-2 sm:items-center">
											<input
												type="number"
												min="0"
												step="0.01"
												className="w-full sm:max-w-[140px] px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
												placeholder={currencyRates.oficial.promedio
													.toFixed(2)
													.toString()}
												value={customRateInput}
												onChange={(e) => setCustomRateInput(e.target.value)}
											/>
											<button
												type="button"
												onClick={handleSaveCustomRate}
												disabled={savingCustomRate}
												className="inline-flex items-center justify-center px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-colors"
											>
												{savingCustomRate ? "Guardando..." : "Guardar tasa"}
											</button>
										</div>
									</div>
								)}
							</>
						) : (
							<div className="flex items-center justify-center flex-1">
								<span className="text-gray-400 text-sm">
									Error al cargar tasas
								</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Grid de estadísticas y calendario - Responsive */}
			<div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
				{/* Pacientes Activos - Solo para médicos */}
				{user?.role === "Médico" && (
					<div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
						<h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
							<FaUserInjured className="text-blue-600" />
							Pacientes Activos
						</h3>
						{loading ? (
							<div className="animate-pulse">
								<div className="h-8 bg-gray-200 rounded w-16 mx-auto"></div>
							</div>
						) : (
							<div className="text-center">
								<p className="text-2xl sm:text-3xl font-bold text-blue-600">
									{stats.activePatients}
								</p>
								<p className="text-gray-600 mt-2 text-sm sm:text-base">
									Pacientes en tratamiento
								</p>
							</div>
						)}
					</div>
				)}

				{/* Calendario de Cirugías - Solo para médicos */}
				{user?.role === "Médico" && (
					<div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 min-h-[300px] sm:min-h-[360px] flex flex-col">
						<h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
							<FaStethoscope className="text-primary" />
							Calendario de Cirugías
						</h3>
						{loading ? (
							<div className="flex-1 flex items-center justify-center">
								<div className="animate-pulse text-gray-400">Cargando calendario...</div>
							</div>
						) : (
							<div className="flex-1 flex items-center justify-center">
								<Calendar surgeries={surgeries} showLegend={false} />
							</div>
						)}
					</div>
				)}

				{/* Para pacientes: mostrar estadísticas de citas */}
				{user?.role === "Paciente" && (
					<div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
						<h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
							<FaCalendarCheck className="text-primary" />
							Mis Citas
						</h3>
						{loading ? (
							<div className="animate-pulse">
								<div className="h-8 bg-gray-200 rounded w-16 mx-auto"></div>
							</div>
						) : (
							<div className="text-center">
								<p className="text-2xl sm:text-3xl font-bold text-primary">
									{stats.totalAppointments}
								</p>
								<p className="text-gray-600 mt-2 text-sm sm:text-base">
									Total de citas
								</p>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Leyenda del calendario - Solo para médicos */}
			{user?.role === "Médico" && surgeries.length > 0 && (
				<div className="mt-4 sm:mt-6 flex justify-center">
					<CalendarLegend
						surgeries={surgeries}
						currentMonth={currentDate.getMonth()}
					/>
				</div>
			)}

			{/* Estadísticas adicionales para médicos */}
			{user?.role === "Médico" && (
				<div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
					<div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
						<h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4">
							Total Citas
						</h3>
						{loading ? (
							<div className="animate-pulse">
								<div className="h-8 bg-gray-200 rounded w-16"></div>
							</div>
						) : (
							<p className="text-2xl sm:text-3xl font-bold text-purple-600">
								{stats.totalAppointments}
							</p>
						)}
					</div>
					<div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
						<h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4">
							Cirugías Hoy
						</h3>
						{loading ? (
							<div className="animate-pulse">
								<div className="h-8 bg-gray-200 rounded w-16"></div>
							</div>
						) : (
							<p className="text-2xl sm:text-3xl font-bold text-orange-600">
								{stats.surgeriesToday}
							</p>
						)}
					</div>
					<div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
						<h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4">
							Total Cirugías
						</h3>
						{loading ? (
							<div className="animate-pulse">
								<div className="h-8 bg-gray-200 rounded w-16"></div>
							</div>
						) : (
							<p className="text-2xl sm:text-3xl font-bold text-indigo-600">
								{stats.totalSurgeries}
							</p>
						)}
					</div>
				</div>
			)}
		</div>
	)
}

export default DashboardHome

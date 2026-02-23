import { useEffect } from "react"
import { useAuth } from "../../auth"
import { useDashboardSearch } from "../contexts/DashboardSearchContext"
import { useDashboardData } from "../hooks/useDashboardData"
import { useSearchFilter } from "../hooks/useSearchFilter"
import { CurrencyCard } from "./cards/CurrencyCard"
import { GeneralStatsCard } from "./cards/GeneralStatsCard"
import { PatientProfileCard } from "./cards/PatientProfileCard"
import { PatientAppointmentsAndSurgeriesCard } from "./cards/PatientAppointmentsAndSurgeriesCard"
import { PatientQuickActionsCard } from "./cards/PatientQuickActionsCard"
import { SurgeryCalendarCard } from "./cards/SurgeryCalendarCard"
import { UpcomingAppointmentsCard } from "./cards/UpcomingAppointmentsCard"
import DashboardHeader from "./DashboardHeader"
import { SearchResults } from "./search/SearchResults"
import { WelcomeSection } from "./welcome/WelcomeSection"

const DashboardHome = () => {
	const { user, refreshUser } = useAuth()
	const { searchTerm } = useDashboardSearch()
	const { data, loading } = useDashboardData()
	const filteredData = useSearchFilter({
		searchTerm,
		appointments: data?.appointments || [],
		surgeries: data?.surgeries || [],
		patients: data?.patients || [],
	})

	const isPatient = String(user?.role ?? "").trim() === "Paciente"

	// Cargar perfil completo del paciente para la card de información personal (al montar o al cambiar rol)
	useEffect(() => {
		if (isPatient) {
			refreshUser()
		}
	}, [isPatient, refreshUser])

	if (!data) {
		return (
			<div className="p-4 sm:p-6">
				<DashboardHeader />
				<div className="flex items-center justify-center min-h-screen">
					<div className="animate-pulse text-gray-400">
						Cargando dashboard...
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="p-3 sm:p-4 md:p-6">
			<DashboardHeader />

			{!isPatient && (
				<SearchResults
					searchTerm={searchTerm}
					appointments={filteredData.appointments}
					surgeries={filteredData.surgeries}
					patients={filteredData.patients}
					hasResults={filteredData.hasResults}
					userRole={user?.role}
				/>
			)}

			{/* Grid principal: bienvenida (+ sistema cambiario solo Médico/Admin) */}
			<div
				className={`grid gap-3 sm:gap-4 md:gap-6 mt-3 sm:mt-4 md:mt-6 ${
					isPatient ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
				}`}
			>
				<WelcomeSection userName={user?.name} gender={user?.gender} role={user?.role} />
				{!isPatient && <CurrencyCard />}
			</div>

			{/* Contenido según rol */}
			{user?.role === "Médico" && (
				<div className="mt-3 sm:mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
					<GeneralStatsCard stats={data.stats} loading={loading} />
					<SurgeryCalendarCard
						surgeries={data.calendarSurgeries}
						loading={loading}
					/>
					<UpcomingAppointmentsCard
						appointments={data.appointments}
						loading={loading}
						title="Próximas Citas"
						emptyMessage="No hay citas próximas"
						showPatientName={true}
					/>
				</div>
			)}

			{isPatient && (
				<div className="mt-3 sm:mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
					<PatientProfileCard user={user} loading={loading} />
					<PatientAppointmentsAndSurgeriesCard
						appointments={data.appointments}
						surgeries={data.surgeries}
						loading={loading}
						maxAppointments={3}
						maxSurgeries={3}
					/>
					<PatientQuickActionsCard />
				</div>
			)}
		</div>
	)
}

export default DashboardHome

import { useAuth } from "../../auth"
import { useDashboardSearch } from "../contexts/DashboardSearchContext"
import { AppointmentsTodayCard } from "./cards/AppointmentsTodayCard"
import { CurrencyCard } from "./cards/CurrencyCard"
import { GeneralStatsCard } from "./cards/GeneralStatsCard"
import { SurgeryCalendarCard } from "./cards/SurgeryCalendarCard"
import { UpcomingAppointmentsCard } from "./cards/UpcomingAppointmentsCard"
import { SearchResults } from "./search/SearchResults"
import { WelcomeSection } from "./welcome/WelcomeSection"
import DashboardHeader from "./DashboardHeader"
import { useDashboardData } from "../hooks/useDashboardData"
import { useSearchFilter } from "../hooks/useSearchFilter"

const DashboardHome = () => {
	const { user } = useAuth()
	const { searchTerm } = useDashboardSearch()
	const { data, loading } = useDashboardData()
	const filteredData = useSearchFilter({
		searchTerm,
		appointments: data?.appointments || [],
		surgeries: data?.surgeries || [],
		patients: data?.patients || [],
	})

	if (!data) {
		return (
			<div className="p-4 sm:p-6">
				<DashboardHeader />
				<div className="flex items-center justify-center min-h-screen">
					<div className="animate-pulse text-gray-400">Cargando dashboard...</div>
				</div>
			</div>
		)
	}

	return (
		<div className="p-3 sm:p-4 md:p-6">
			<DashboardHeader />

			<SearchResults
				searchTerm={searchTerm}
				appointments={filteredData.appointments}
				surgeries={filteredData.surgeries}
				patients={filteredData.patients}
				hasResults={filteredData.hasResults}
				userRole={user?.role}
			/>

			{/* Grid principal - Responsive */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mt-3 sm:mt-4 md:mt-6">
				<WelcomeSection userName={user?.name} />

				<AppointmentsTodayCard count={data.stats.appointmentsToday} loading={loading} />

				<CurrencyCard />
			</div>

			{/* Grid de estadísticas y calendario - Responsive */}
			<div className="mt-3 sm:mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
				{user?.role === "Médico" && (
					<>
						<GeneralStatsCard stats={data.stats} loading={loading} />
						<SurgeryCalendarCard surgeries={data.calendarSurgeries} loading={loading} />
						<UpcomingAppointmentsCard
							appointments={data.appointments}
							loading={loading}
							title="Próximas Citas"
							emptyMessage="No hay citas próximas"
							showPatientName={true}
						/>
					</>
				)}

				{user?.role === "Paciente" && (
					<UpcomingAppointmentsCard
						appointments={data.appointments}
						loading={loading}
						title="Mis Próximas Citas"
						emptyMessage="No tienes citas próximas"
						showPatientName={false}
					/>
				)}
			</div>
		</div>
	)
}

export default DashboardHome

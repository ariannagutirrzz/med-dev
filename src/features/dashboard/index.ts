// Dashboard Feature Exports
export { default as Dashboard } from "./components/Dashboard"
export { default as DashboardHeader } from "./components/DashboardHeader"
export { default as DashboardHome } from "./components/DashboardHome"
export {
	DashboardSearchProvider,
	useDashboardSearch,
} from "./contexts/DashboardSearchContext"

// Hooks
export { useDashboardData } from "./hooks/useDashboardData"
export { useCurrencyRates } from "./hooks/useCurrencyRates"
export { useSearchFilter } from "./hooks/useSearchFilter"

// Types
export type { DashboardStats } from "./types/dashboard.types"

// Components (for external use if needed)
export { AppointmentsTodayCard } from "./components/cards/AppointmentsTodayCard"
export { CurrencyCard } from "./components/cards/CurrencyCard"
export { GeneralStatsCard } from "./components/cards/GeneralStatsCard"
export { SurgeryCalendarCard } from "./components/cards/SurgeryCalendarCard"
export { UpcomingAppointmentsCard } from "./components/cards/UpcomingAppointmentsCard"
export { WelcomeSection } from "./components/welcome/WelcomeSection"
export { SearchResults } from "./components/search/SearchResults"

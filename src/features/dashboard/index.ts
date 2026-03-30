// Dashboard Feature Exports

// Components (for external use if needed)
export { AppointmentsTodayCard } from "./components/cards/AppointmentsTodayCard"
export { CurrencyCard } from "./components/cards/CurrencyCard"
export { GeneralStatsCard } from "./components/cards/GeneralStatsCard"
export { SurgeryCalendarCard } from "./components/cards/SurgeryCalendarCard"
export { UpcomingAppointmentsCard } from "./components/cards/UpcomingAppointmentsCard"
export { default as Dashboard } from "./components/Dashboard"
export { default as DashboardHeader } from "./components/DashboardHeader"
export { default as DashboardHome } from "./components/DashboardHome"
export { SearchResults } from "./components/search/SearchResults"
export { WelcomeSection } from "./components/welcome/WelcomeSection"
export {
	DashboardSearchProvider,
	useDashboardSearch,
} from "./contexts/DashboardSearchContext"
export { useCurrencyRates } from "./hooks/useCurrencyRates"
// Hooks
export { useDashboardData } from "./hooks/useDashboardData"
export { useSearchFilter } from "./hooks/useSearchFilter"
// Types
export type { DashboardStats } from "./types/dashboard.types"

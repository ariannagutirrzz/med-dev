import { FaStethoscope } from "react-icons/fa"
import { Calendar } from "../../../../shared"
import type { Surgery as CalendarSurgery } from "../../../../shared/components/Calendar"

interface SurgeryCalendarCardProps {
	surgeries: CalendarSurgery[]
	loading: boolean
}

export const SurgeryCalendarCard = ({
	surgeries,
	loading,
}: SurgeryCalendarCardProps) => {
	return (
		<div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 min-h-[280px] sm:min-h-[320px] md:min-h-[360px] flex flex-col">
			<h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 mb-2 sm:mb-3 md:mb-4 flex items-center gap-1 sm:gap-2">
				<FaStethoscope className="text-primary text-sm sm:text-base" />
				<span>Calendario de Cirugías</span>
			</h3>
			{loading ? (
				<div className="flex-1 flex items-center justify-center">
					<div className="animate-pulse text-gray-400 text-xs sm:text-sm">Cargando calendario...</div>
				</div>
			) : (
				<div className="flex-1 flex items-center justify-center overflow-hidden">
					<Calendar surgeries={surgeries} showLegend={false} />
				</div>
			)}
		</div>
	)
}

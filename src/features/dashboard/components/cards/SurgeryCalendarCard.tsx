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
	)
}

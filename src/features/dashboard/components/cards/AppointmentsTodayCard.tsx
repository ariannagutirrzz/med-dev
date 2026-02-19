import { FaCalendarCheck } from "react-icons/fa"

interface AppointmentsTodayCardProps {
	count: number
	loading: boolean
}

export const AppointmentsTodayCard = ({
	count,
	loading,
}: AppointmentsTodayCardProps) => {
	return (
		<div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 flex flex-col min-h-[120px] sm:min-h-[140px]">
			<h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 mb-2 sm:mb-3 md:mb-4 flex items-center gap-1 sm:gap-2">
				<FaCalendarCheck className="text-primary text-sm sm:text-base" />
				<span>Citas Hoy</span>
			</h3>
			{loading ? (
				<div className="flex-1 flex items-center justify-center">
					<div className="animate-pulse h-6 sm:h-8 bg-gray-200 rounded w-12 sm:w-16"></div>
				</div>
			) : (
				<div className="flex-1 flex flex-col items-center justify-center text-center">
					<p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-green-600">
						{count}
					</p>
				</div>
			)}
		</div>
	)
}

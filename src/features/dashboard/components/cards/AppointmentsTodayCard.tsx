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
		<div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col">
			<h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
				<FaCalendarCheck className="text-primary" />
				Citas Hoy
			</h3>
			{loading ? (
				<div className="flex-1 flex items-center justify-center">
					<div className="animate-pulse h-8 bg-gray-200 rounded w-16"></div>
				</div>
			) : (
				<div className="flex-1 flex flex-col items-center justify-center text-center">
					<p className="text-2xl sm:text-3xl font-bold text-green-600">
						{count}
					</p>
				</div>
			)}
		</div>
	)
}

import { FaCalendarCheck, FaCalendarDay, FaStethoscope, FaUserInjured } from "react-icons/fa"
import { MdProductionQuantityLimits } from "react-icons/md"
import type { DashboardStats } from "../../types/dashboard.types"

interface GeneralStatsCardProps {
	stats: DashboardStats
	loading: boolean
}

export const GeneralStatsCard = ({ stats, loading }: GeneralStatsCardProps) => {
	return (
		<div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 h-full flex flex-col">
			<h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 mb-3 sm:mb-4">
				Resumen General
			</h3>
			{loading ? (
				<div className="animate-pulse space-y-3 sm:space-y-4">
					<div className="h-10 sm:h-12 bg-gray-200 rounded"></div>
					<div className="h-10 sm:h-12 bg-gray-200 rounded"></div>
					<div className="h-10 sm:h-12 bg-gray-200 rounded"></div>
				</div>
			) : (
				<div className="space-y-2 sm:space-y-3 md:space-y-4">
					<div className="flex items-center justify-between p-2 sm:p-3 bg-teal-50 rounded-lg">
						<div className="flex items-center gap-1 sm:gap-2">
							<FaCalendarDay className="text-teal-600 text-sm sm:text-base" />
							<span className="text-xs sm:text-sm md:text-base font-medium text-gray-700">
								Citas Hoy
							</span>
						</div>
						<span className="text-lg sm:text-xl md:text-2xl font-bold text-teal-600">
							{stats.appointmentsToday}
						</span>
					</div>
					<div className="flex items-center justify-between p-2 sm:p-3 bg-blue-50 rounded-lg">
						<div className="flex items-center gap-1 sm:gap-2">
							<FaUserInjured className="text-blue-600 text-sm sm:text-base" />
							<span className="text-xs sm:text-sm md:text-base font-medium text-gray-700">
								Pacientes Activos
							</span>
						</div>
						<span className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">
							{stats.activePatients}
						</span>
					</div>
					<div className="flex items-center justify-between p-2 sm:p-3 bg-purple-50 rounded-lg">
						<div className="flex items-center gap-1 sm:gap-2">
							<FaCalendarCheck className="text-purple-600 text-sm sm:text-base" />
							<span className="text-xs sm:text-sm md:text-base font-medium text-gray-700">
								Total Citas
							</span>
						</div>
						<span className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600">
							{stats.totalAppointments}
						</span>
					</div>
					<div className="flex items-center justify-between p-2 sm:p-3 bg-lime-50 rounded-lg">
						<div className="flex items-center gap-1 sm:gap-2">
							<FaStethoscope className="text-lime-600 text-sm sm:text-base" />
							<span className="text-xs sm:text-sm md:text-base font-medium text-gray-700">
								Total Cirugías
							</span>
						</div>
						<span className="text-lg sm:text-xl md:text-2xl font-bold text-lime-600">
							{stats.totalSurgeries}
						</span>
					</div>
					<div className="flex items-center justify-between p-2 sm:p-3 bg-red-50 rounded-lg">
						<div className="flex items-center gap-1 sm:gap-2">
							<MdProductionQuantityLimits className="text-red-600 text-sm sm:text-base" />
							<span className="text-xs sm:text-sm md:text-base font-medium text-gray-700">
								Productos con stock bajo u agotado
							</span>
						</div>
						<span className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">
							{stats.totalLowStockSupplies}
						</span>
					</div>
				</div>
			)}
		</div>
	)
}

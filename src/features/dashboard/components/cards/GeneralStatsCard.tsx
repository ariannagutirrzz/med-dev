import { FaUserInjured, FaCalendarCheck, FaStethoscope } from "react-icons/fa"
import type { DashboardStats } from "../../types/dashboard.types"

interface GeneralStatsCardProps {
	stats: DashboardStats
	loading: boolean
}

export const GeneralStatsCard = ({ stats, loading }: GeneralStatsCardProps) => {
	return (
		<div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
			<h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-4">
				Resumen General
			</h3>
			{loading ? (
				<div className="animate-pulse space-y-4">
					<div className="h-12 bg-gray-200 rounded"></div>
					<div className="h-12 bg-gray-200 rounded"></div>
					<div className="h-12 bg-gray-200 rounded"></div>
				</div>
			) : (
				<div className="space-y-4">
					<div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
						<div className="flex items-center gap-2">
							<FaUserInjured className="text-blue-600" />
							<span className="text-sm font-medium text-gray-700">
								Pacientes Activos
							</span>
						</div>
						<span className="text-xl font-bold text-blue-600">
							{stats.activePatients}
						</span>
					</div>
					<div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
						<div className="flex items-center gap-2">
							<FaCalendarCheck className="text-purple-600" />
							<span className="text-sm font-medium text-gray-700">
								Total Citas
							</span>
						</div>
						<span className="text-xl font-bold text-purple-600">
							{stats.totalAppointments}
						</span>
					</div>
					<div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
						<div className="flex items-center gap-2">
							<FaStethoscope className="text-orange-600" />
							<span className="text-sm font-medium text-gray-700">
								Total Cirugías
							</span>
						</div>
						<span className="text-xl font-bold text-orange-600">
							{stats.totalSurgeries}
						</span>
					</div>
				</div>
			)}
		</div>
	)
}

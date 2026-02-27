import { AiFillThunderbolt } from "react-icons/ai"
import { CiCalendar, CiSettings } from "react-icons/ci"
import { Link } from "react-router-dom"

const actions = [
	{
		label: "Ver mis citas",
		description: "Próximas citas y historial",
		to: "/dashboard/citas",
		icon: CiCalendar,
	},
	{
		label: "Configuración",
		description: "Actualizar perfil y contraseña",
		to: "/dashboard/configuracion",
		icon: CiSettings,
	},
] as const

export const PatientQuickActionsCard = () => {
	return (
		<div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 flex flex-col min-h-0">
			<h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 mb-2 sm:mb-3 flex flex-row items-center gap-2">
				<AiFillThunderbolt className="text-primary" />
				Acciones rápidas
			</h3>
			<div className="flex flex-col gap-2 sm:gap-3">
				{actions.map(({ label, description, to, icon: Icon }) => (
					<Link
						key={to}
						to={to}
						className="flex items-center gap-3 p-2.5 sm:p-3 rounded-lg border border-gray-200 hover:border-primary/40 hover:bg-primary/5 transition-colors group"
					>
						<div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
							<Icon className="w-5 h-5" />
						</div>
						<div className="min-w-0 flex-1">
							<p className="font-medium text-gray-800 text-sm sm:text-base">
								{label}
							</p>
							<p className="text-xs text-gray-500 truncate">{description}</p>
						</div>
					</Link>
				))}
			</div>
		</div>
	)
}

import { CiCalendar } from "react-icons/ci"
import { HiOutlineBars3 } from "react-icons/hi2"
import { Button } from "../../../shared"
import { NotificationBell } from "../../notifications"
import { useDashboardLayout } from "../contexts/DashboardLayoutContext"

export default function DashboardHeader() {
	const { isMobile, onToggleSidebar } = useDashboardLayout()

	const now = new Date()
	const weekday = now.toLocaleDateString("es-ES", { weekday: "long" })
	const dateFormatted = now.toLocaleDateString("es-ES", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	})

	return (
		<div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
			{/* Mobile: menú + fecha + campana. Desktop: solo fecha a la izquierda */}
			<div className="flex flex-row items-center justify-between md:justify-start gap-2 min-w-0 shrink-0">
				{isMobile && (
					<Button
						type="button"
						variant="text"
						onClick={onToggleSidebar}
						aria-label="Abrir menú"
						className="!w-8 !h-8 !min-w-0 !p-0 flex items-center justify-center shrink-0 !text-gray-600 hover:!bg-gray-100 !rounded-md"
					>
						<HiOutlineBars3 className="w-5 h-5 text-gray-600" />
					</Button>
				)}
				<h2 className="text-sm sm:text-base lg:text-lg text-gray-400 font-semibold flex flex-row items-center gap-1 sm:gap-2 capitalize">
					<CiCalendar className="text-primary font-semibold text-base sm:text-lg shrink-0" />
					<span className="hidden xs:inline">{weekday}</span>
					<span className="xs:hidden">{weekday.slice(0, 3)}</span>
					<b className="text-primary font-semibold">{dateFormatted}</b>
				</h2>
				{/* Solo en móvil: campana al lado de la fecha */}
				<div className="flex items-center shrink-0 md:hidden">
					<NotificationBell />
				</div>
			</div>

			{/* Desktop: campana a la derecha de la pantalla */}
			<div className="hidden md:flex items-center shrink-0">
				<NotificationBell />
			</div>
		</div>
	)
}

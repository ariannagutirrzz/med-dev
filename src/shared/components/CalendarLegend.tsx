import { CiClock2 } from "react-icons/ci"
import type { Surgery } from "./Calendar"

interface CalendarLegendProps {
	surgeries: Surgery[]
	currentMonth: number
}

const CalendarLegend: React.FC<CalendarLegendProps> = ({
	surgeries,
	currentMonth,
}) => {
	const monthNames = [
		"Enero",
		"Febrero",
		"Marzo",
		"Abril",
		"Mayo",
		"Junio",
		"Julio",
		"Agosto",
		"Septiembre",
		"Octubre",
		"Noviembre",
		"Diciembre",
	]

	return (
		<div className="space-y-2">
			{surgeries.map((surgery) => (
				<div
					key={`${surgery.day}-${surgery.type}`}
					className="flex items-center text-xs"
				>
					<div className={`w-2 h-2 rounded-full mr-2 bg-primary`}></div>
					<div>
						<h5 className="text-base font-semibold">{surgery.type} </h5>
						<div className="flex flex-row justify-start items-center gap-1">
							<CiClock2 className="h-4 w-4" />
							<span className="font-bold text-xs">
								{surgery.day} {monthNames[currentMonth]}
							</span>
						</div>
					</div>
				</div>
			))}
		</div>
	)
}

export default CalendarLegend

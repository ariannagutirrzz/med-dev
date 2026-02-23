import { useState } from "react"
import Button from "./common/Button"

export interface Surgery {
	day: number
	month: number
	year: number
	type: "Cirugía Mayor" | "Cirugía Menor" | "Cirugía Programada"
}

interface CalendarProps {
	surgeries?: Surgery[]
	showLegend?: boolean
	/** Tamaño visual del calendario (por defecto 'md') */
	size?: "sm" | "md" | "lg"
}

const sizeClasses = {
	sm: { cell: "h-6", dayLabel: "text-xs py-0.5", month: "text-base", gap: "gap-0.5" },
	md: { cell: "h-8", dayLabel: "text-xs py-1", month: "text-lg", gap: "gap-1" },
	lg: { cell: "h-10", dayLabel: "text-sm py-1.5", month: "text-xl", gap: "gap-2" },
}

const Calendar: React.FC<CalendarProps> = ({ surgeries = [], size = "md" }) => {
	const classes = sizeClasses[size]
	const [currentDate, setCurrentDate] = useState(new Date())

	// Solo cirugías del mes/año actualmente mostrado
	const surgeriesThisMonth = surgeries.filter(
		(s) =>
			s.month === currentDate.getMonth() &&
			s.year === currentDate.getFullYear()
	)

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

	const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

	// Obtener el primer día del mes
	const firstDayOfMonth = new Date(
		currentDate.getFullYear(),
		currentDate.getMonth(),
		1,
	)
	// Obtener el último día del mes
	const lastDayOfMonth = new Date(
		currentDate.getFullYear(),
		currentDate.getMonth() + 1,
		0,
	)
	// Días en el mes
	const daysInMonth = lastDayOfMonth.getDate()
	// Día de la semana del primer día (0 = Domingo, 1 = Lunes, etc.)
	const startingDay = firstDayOfMonth.getDay()

	// Generar array de días del mes
	const days = []
	for (let i = 1; i <= daysInMonth; i++) {
		days.push(i)
	}

	const navigateMonth = (direction: number) => {
		setCurrentDate(
			new Date(
				currentDate.getFullYear(),
				currentDate.getMonth() + direction,
				1,
			),
		)
	}

	const getSurgeryForDay = (day: number) => {
		return surgeriesThisMonth.find((surgery) => surgery.day === day)
	}

	return (
		<div className="w-full">
			<div className={`flex justify-between items-center mb-4 ${classes.gap}`}>
				<Button
					type="button"
					variant="text"
					onClick={() => navigateMonth(-1)}
					className="!p-2 !min-w-0 text-gray-600 hover:!bg-gray-100"
				>
					‹
				</Button>
				<h4 className={`${classes.month} font-semibold text-gray-800`}>
					{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
				</h4>
				<Button
					type="button"
					variant="text"
					onClick={() => navigateMonth(1)}
					className="!p-2 !min-w-0 text-gray-600 hover:!bg-gray-100"
				>
					›
				</Button>
			</div>

			<div className={`grid grid-cols-7 ${classes.gap} mb-2`}>
				{dayNames.map((day) => (
					<div
						key={day}
						className={`text-center font-medium text-gray-500 ${classes.dayLabel}`}
					>
						{day}
					</div>
				))}
			</div>

			<div className={`grid grid-cols-7 ${classes.gap}`}>
				{Array.from({ length: startingDay }).map((_, i) => {
					const key = `empty-${currentDate.getFullYear()}-${currentDate.getMonth()}-${i}`
					return <div key={key} className={classes.cell}></div>
				})}

				{days.map((day) => {
					const surgery = getSurgeryForDay(day)
					const isToday =
						day === new Date().getDate() &&
						currentDate.getMonth() === new Date().getMonth() &&
						currentDate.getFullYear() === new Date().getFullYear()

					return (
						<div
							key={day}
							className={`${classes.cell} flex items-center justify-center text-sm relative ${
								isToday ? "bg-primary text-white rounded-full" : "text-gray-700"
							}`}
						>
							{day}
							{surgery && (
								<div
									className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full bg-primary`}
									title={surgery.type}
								></div>
							)}
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default Calendar

import { useState } from "react"

export interface Surgery {
	day: number
	type: "Cirugía Mayor" | "Cirugía Menor" | "Cirugía Programada"
}

interface CalendarProps {
	surgeries?: Surgery[]
	showLegend?: boolean // Nueva prop para controlar la leyenda
}

const Calendar: React.FC<CalendarProps> = ({
	surgeries = [
		{ day: 15, type: "Cirugía Mayor" },
		{ day: 18, type: "Cirugía Menor" },
		{ day: 22, type: "Cirugía Programada" },
		{ day: 25, type: "Cirugía Mayor" },
	],
}) => {
	const [currentDate, setCurrentDate] = useState(new Date())

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
		return surgeries.find((surgery) => surgery.day === day)
	}

	return (
		<div className="w-full">
			{/* Header del calendario */}
			<div className="flex justify-between items-center mb-4">
				<button
					type="button"
					onClick={() => navigateMonth(-1)}
					className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
				>
					‹
				</button>
				<h4 className="text-lg font-semibold text-gray-800">
					{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
				</h4>
				<button
					type="button"
					onClick={() => navigateMonth(1)}
					className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
				>
					›
				</button>
			</div>

			{/* Días de la semana */}
			<div className="grid grid-cols-7 gap-1 mb-2">
				{dayNames.map((day) => (
					<div
						key={day}
						className="text-center text-xs font-medium text-gray-500 py-1"
					>
						{day}
					</div>
				))}
			</div>

			{/* Días del mes */}
			<div className="grid grid-cols-7 gap-1">
				{/* Espacios vacíos para alinear el primer día */}
				{Array.from({ length: startingDay }).map((_, i) => {
					const key = `empty-${currentDate.getFullYear()}-${currentDate.getMonth()}-${i}`
					return <div key={key} className="h-8"></div>
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
							className={`h-8 flex items-center justify-center text-sm relative ${
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

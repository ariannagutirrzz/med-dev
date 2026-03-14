import { useRef, useState } from "react"
import { createPortal } from "react-dom"
import Button from "./common/Button"

interface DayCellProps {
	day: number
	isToday: boolean
	hasSurgeries: boolean
	surgeries: Surgery[]
	cellClass: string
	monthName: string
	year: number
}

const TOOLTIP_WIDTH = 256

function DayCell({
	day,
	isToday,
	hasSurgeries,
	surgeries,
	cellClass,
	monthName,
	year,
}: DayCellProps) {
	const [isHovered, setIsHovered] = useState(false)
	const [tooltipRect, setTooltipRect] = useState<DOMRect | null>(null)
	const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
		if (!hasSurgeries) return
		if (leaveTimeoutRef.current) {
			clearTimeout(leaveTimeoutRef.current)
			leaveTimeoutRef.current = null
		}
		const rect = e.currentTarget.getBoundingClientRect()
		setTooltipRect(rect)
		setIsHovered(true)
	}

	const handleMouseLeave = () => {
		leaveTimeoutRef.current = setTimeout(() => {
			setIsHovered(false)
			setTooltipRect(null)
			leaveTimeoutRef.current = null
		}, 150)
	}

	const handleTooltipMouseEnter = () => {
		if (leaveTimeoutRef.current) {
			clearTimeout(leaveTimeoutRef.current)
			leaveTimeoutRef.current = null
		}
		setIsHovered(true)
	}

	const handleTooltipMouseLeave = () => {
		setIsHovered(false)
		setTooltipRect(null)
	}

	const content = (
		<>
			<span
				className={`inline-flex items-center justify-center w-full h-full text-sm rounded-full ${
					isToday ? "bg-primary text-white" : "text-gray-700"
				}`}
			>
				{day}
			</span>
			{hasSurgeries && (
				<div
					className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full ${
						isToday ? "bg-white" : "bg-primary"
					}`}
				/>
			)}
		</>
	)

	const tooltipContent = isHovered && hasSurgeries && tooltipRect && createPortal(
		<div
			className="fixed z-[9999] w-64 max-w-[90vw] p-3 bg-white text-left rounded-lg shadow-lg border border-gray-200 ring-1 ring-black/5"
			role="tooltip"
			style={{
				left: Math.max(8, tooltipRect.left + tooltipRect.width / 2 - TOOLTIP_WIDTH / 2),
				top: tooltipRect.top - 8,
				transform: "translateY(-100%)",
			}}
			onMouseEnter={handleTooltipMouseEnter}
			onMouseLeave={handleTooltipMouseLeave}
		>
			<p className="font-semibold text-xs text-gray-500 mb-2">
				{day} {monthName} {year}
			</p>
			<ul className="space-y-2">
				{surgeries.map((s) => (
					<li
						key={s.id ?? `${day}-${s.type}-${s.patientName ?? ""}`}
						className="text-xs border-b border-gray-100 last:border-0 pb-2 last:pb-0"
					>
						<span className="font-medium text-primary">{s.type}</span>
						{s.patientName && (
							<p className="mt-0.5 text-gray-700">Paciente: {s.patientName}</p>
						)}
						{s.doctorName && (
							<p className="text-gray-500">Médico: {s.doctorName}</p>
						)}
						{s.notes && (
							<p className="mt-0.5 text-gray-500 line-clamp-2">{s.notes}</p>
						)}
					</li>
				))}
			</ul>
		</div>,
		document.body,
	)

	return (
		<>
			{hasSurgeries ? (
				<button
					type="button"
					className={`${cellClass} relative flex items-center justify-center cursor-pointer border-0 bg-transparent`}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					aria-label={`${day} ${monthName}: ${surgeries.length} cirugía(s)`}
				>
					{content}
				</button>
			) : (
				<div className={`${cellClass} relative flex items-center justify-center`}>
					{content}
				</div>
			)}
			{tooltipContent}
		</>
	)
}

export interface Surgery {
	day: number
	month: number
	year: number
	type: "Cirugía Mayor" | "Cirugía Menor" | "Cirugía Programada"
	/** Optional details for hover tooltip */
	id?: number
	patientName?: string
	doctorName?: string
	notes?: string | null
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

	const getSurgeriesForDay = (day: number) => {
		return surgeriesThisMonth.filter((surgery) => surgery.day === day)
	}

	return (
		<div className="w-full overflow-visible">
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

			<div className={`grid grid-cols-7 ${classes.gap} overflow-visible`}>
				{Array.from({ length: startingDay }).map((_, i) => {
					const key = `empty-${currentDate.getFullYear()}-${currentDate.getMonth()}-${i}`
					return <div key={key} className={classes.cell}></div>
				})}

				{days.map((day) => {
					const daySurgeries = getSurgeriesForDay(day)
					const hasSurgeries = daySurgeries.length > 0
					const isToday =
						day === new Date().getDate() &&
						currentDate.getMonth() === new Date().getMonth() &&
						currentDate.getFullYear() === new Date().getFullYear()

					return (
						<DayCell
							key={day}
							day={day}
							isToday={isToday}
							hasSurgeries={hasSurgeries}
							surgeries={daySurgeries}
							cellClass={classes.cell}
							monthName={monthNames[currentDate.getMonth()]}
							year={currentDate.getFullYear()}
						/>
					)
				})}
			</div>
		</div>
	)
}

export default Calendar

import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts"

const PRIMARY_COLOR = "var(--color-primary)"
const GRID_COLOR = "var(--color-muted-light)"

type ChartDataPoint = { monthLabel: string; [key: string]: string | number }

interface BarChartCardProps {
	title: string
	description?: string
	data: ChartDataPoint[]
	dataKey: string
	valueLabel?: string
	formatValue?: (n: number) => string
	/** When true, do not render the outer card; content only (for use inside a parent card). */
	embedded?: boolean
}

export function BarChartCard({
	title,
	description,
	data,
	dataKey,
	valueLabel,
	formatValue = (n) => String(n),
	embedded = false,
}: BarChartCardProps) {
	const content = (
		<>
			<div className="mb-3">
				<h3 className="font-semibold text-gray-800">{title}</h3>
				{description && (
					<p className="text-xs text-gray-500 mt-0.5">{description}</p>
				)}
			</div>
			<div className="flex-1 min-h-[240px] w-full">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart
						data={data}
						margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
					>
						<CartesianGrid
							strokeDasharray="3 3"
							vertical={false}
							stroke={GRID_COLOR}
						/>
						<XAxis
							dataKey="monthLabel"
							tick={{ fontSize: 11, fill: "var(--color-muted)" }}
							tickLine={false}
							axisLine={false}
							tickMargin={8}
						/>
						<YAxis
							tick={{ fontSize: 11, fill: "var(--color-muted)" }}
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={formatValue}
							allowDecimals={false}
							width={36}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: "var(--color-bg)",
								border: "1px solid var(--color-muted-light)",
								borderRadius: "8px",
								fontSize: "12px",
							}}
							labelStyle={{ color: "var(--color-text)" }}
							formatter={(value: number) => [formatValue(value), valueLabel ?? dataKey]}
							labelFormatter={(label) => label}
						/>
						<Bar
							dataKey={dataKey}
							fill={PRIMARY_COLOR}
							radius={[4, 4, 0, 0]}
							maxBarSize={48}
						/>
					</BarChart>
				</ResponsiveContainer>
			</div>
		</>
	)

	if (embedded) {
		return (
			<div className="flex flex-col flex-1 min-h-[200px]">{content}</div>
		)
	}

	return (
		<div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 flex flex-col h-full min-h-[320px]">
			{content}
		</div>
	)
}

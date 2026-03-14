import {
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts"

const PRIMARY_COLOR = "var(--color-primary)"
const PREDICTED_COLOR = "var(--color-primary)"
const PREDICTED_OPACITY = 0.5
const GRID_COLOR = "var(--color-muted-light)"

type ChartDataPoint = { monthLabel: string; [key: string]: string | number }

interface BarChartCardProps {
	title: string
	description?: string
	data: ChartDataPoint[]
	dataKey: string
	/** Optional second series for predicted values (e.g. dataKeyPrediccion="prediccion"). Shows legend "Histórico" / "Predicción". */
	dataKeyPrediccion?: string
	valueLabel?: string
	formatValue?: (n: number) => string
	/** When true, do not render the outer card; content only (for use inside a parent card). */
	embedded?: boolean
	/** Width reserved for Y-axis labels (e.g. 64 for currency to avoid clipping). Default 36. */
	yAxisWidth?: number
}

export function BarChartCard({
	title,
	description,
	data,
	dataKey,
	dataKeyPrediccion,
	valueLabel,
	formatValue = (n) => String(n),
	embedded = false,
	yAxisWidth = 36,
}: BarChartCardProps) {
	const showPrediction = Boolean(dataKeyPrediccion && data.some((d) => Number(d[dataKeyPrediccion]) > 0))
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
						margin={{ top: 8, right: 8, left: yAxisWidth > 40 ? 12 : 0, bottom: 0 }}
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
							width={yAxisWidth}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: "var(--color-bg)",
								border: "1px solid var(--color-muted-light)",
								borderRadius: "8px",
								fontSize: "12px",
							}}
							labelStyle={{ color: "var(--color-text)" }}
							formatter={(value: number, name: string) => [
								formatValue(value),
								name === "prediccion" ? "Predicción" : valueLabel ?? dataKey,
							]}
							labelFormatter={(label) => label}
						/>
						{showPrediction && (
							<Legend
								verticalAlign="top"
								height={24}
								formatter={(value) => (value === "prediccion" ? "Predicción" : "Histórico")}
							/>
						)}
						<Bar
							dataKey={dataKey}
							name="historico"
							fill={PRIMARY_COLOR}
							radius={[4, 4, 0, 0]}
							maxBarSize={showPrediction ? 32 : 48}
						/>
						{showPrediction && dataKeyPrediccion && (
							<Bar
								dataKey={dataKeyPrediccion}
								name="prediccion"
								fill={PREDICTED_COLOR}
								fillOpacity={PREDICTED_OPACITY}
								radius={[4, 4, 0, 0]}
								maxBarSize={32}
							/>
						)}
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

import { Input, Select } from "antd"
import type { ReactNode } from "react"
import { MdSearch } from "react-icons/md"

export type DataFilterPanelSelect = {
	/** Stable key for list rendering */
	id?: string
	value: string
	onChange: (value: string) => void
	options: { value: string; label: string }[]
	placeholder?: string
	/** e.g. `w-full sm:w-[220px]` */
	selectClassName?: string
}

export type DataFilterPanelProps = {
	className?: string
	/**
	 * When false, hides the search row (e.g. Reportes). Default true.
	 * `actions` still render in their own row if provided without search.
	 */
	showSearch?: boolean
	searchPlaceholder?: string
	searchValue?: string
	onSearchChange?: (value: string) => void
	searchPrefix?: ReactNode
	filters?: DataFilterPanelSelect[]
	/** Shown after filters on the same row when space allows (wraps on small screens). */
	actions?: ReactNode
	/** Extra content below the search + filters row (full width). */
	children?: ReactNode
}

const selectHeightStyle = { height: 42 } as const

/**
 * Unified panel shell (`rounded-2xl` card): optional search, optional select filters, optional custom body.
 */
const DataFilterPanel = ({
	className = "",
	showSearch = true,
	searchPlaceholder = "",
	searchValue = "",
	onSearchChange,
	searchPrefix,
	filters,
	actions,
	children,
}: DataFilterPanelProps) => {
	const hasSearch =
		showSearch && typeof onSearchChange === "function" && searchPlaceholder !== ""
	const hasFilters = Boolean(filters && filters.length > 0)
	const hasToolbar = hasSearch || hasFilters || Boolean(actions)

	return (
		<div
			className={`bg-white rounded-2xl shadow-lg p-4 ${className}`.trim()}
		>
			<div className="flex flex-col gap-4">
				{hasToolbar ? (
					<div className="flex flex-wrap items-center gap-3 sm:gap-4">
						{hasSearch ? (
							<div className="min-w-0 w-full sm:w-auto sm:flex-1 sm:min-w-48">
								<Input
									placeholder={searchPlaceholder}
									value={searchValue}
									onChange={(e) => onSearchChange(e.target.value)}
									prefix={searchPrefix ?? <MdSearch className="text-gray-400" />}
									allowClear
									size="large"
									className="rounded-lg w-full"
								/>
							</div>
						) : null}
						{hasFilters ? (
							<div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
								{filters.map((f, index) => (
									<Select
										key={f.id ?? String(index)}
										value={f.value}
										onChange={(v) => f.onChange(String(v))}
										className={f.selectClassName ?? "w-full sm:w-[180px]"}
										placeholder={f.placeholder}
										style={selectHeightStyle}
										options={f.options}
									/>
								))}
							</div>
						) : null}
						{actions ? (
							<div className="flex shrink-0 items-center w-full sm:w-auto sm:ml-auto">
								{actions}
							</div>
						) : null}
					</div>
				) : null}

				{children}
			</div>
		</div>
	)
}

export default DataFilterPanel

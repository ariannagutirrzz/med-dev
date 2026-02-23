import { Input, Select, Tooltip } from "antd"
import type { InputProps } from "antd"
import { FaExclamationCircle } from "react-icons/fa"
import { useMemo } from "react"
import {
	COUNTRY_PHONE_OPTIONS,
	splitE164,
} from "../../utils/phoneFormat"

const TOOLTIP_PHONE_MSG =
	"Si el número de teléfono no es ingresado correctamente no se le podrá enviar el mensaje para sus citas."

export interface PhoneInputProps
	extends Omit<InputProps, "value" | "onChange" | "type"> {
	/** Value in E.164 format (e.g. +584241234567) */
	value?: string
	/** Called with E.164 value when input changes */
	onChange?: (e164Value: string) => void
}

function formatNationalDisplay(national: string, maxLength: number): string {
	const d = national.replace(/\D/g, "").slice(0, maxLength)
	if (d.length <= 3) return d
	if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`
	return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`
}

/**
 * Phone input with country code selector + national number.
 * Value is always E.164. Avoids errors by choosing country from a list.
 */
const PhoneInput = ({
	value = "",
	onChange,
	placeholder,
	disabled,
	className,
	id,
	...rest
}: PhoneInputProps) => {
	const { countryCode, national } = useMemo(() => splitE164(value), [value])

	const country = useMemo(
		() => COUNTRY_PHONE_OPTIONS.find((c) => c.code === countryCode),
		[countryCode],
	)
	const nationalLength = country?.nationalLength ?? 10
	const displayNational = formatNationalDisplay(national, nationalLength)

	const selectOptions = useMemo(
		() =>
			COUNTRY_PHONE_OPTIONS.map((c) => ({
				value: c.code,
				label: `${c.dial} ${c.name}`,
			})),
		[],
	)

	// Una vez seleccionado: solo el código numérico (ej. +58)
	const selectLabelRender = (props: { value?: string; label?: React.ReactNode }) => {
		const opt = COUNTRY_PHONE_OPTIONS.find((c) => c.code === props.value)
		return opt?.dial ?? props.label ?? ""
	}

	const buildE164 = (code: string, nationalDigits: string) => {
		const digits = nationalDigits.replace(/\D/g, "")
		if (!digits) return ""
		return `+${code}${digits}`
	}

	const handleCountryChange = (code: string) => {
		const digits = national.replace(/\D/g, "")
		onChange?.(buildE164(code, digits))
	}

	const handleNationalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value.replace(/[^\d\s]/g, "")
		const digits = raw.replace(/\D/g, "")
		onChange?.(buildE164(countryCode, digits))
	}

	// Placeholder sin código de país (el código va en el selector)
	const normalizedPlaceholder =
		(placeholder ?? "4XX XXX XXXX").replace(/^\s*\+?\d+\s+/, "") || "4XX XXX XXXX"

	return (
		<Input.Group compact className={className} style={{ display: "flex" }}>
			<Select
				value={countryCode}
				onChange={handleCountryChange}
				disabled={disabled}
				options={selectOptions}
				labelRender={selectLabelRender}
				style={{ width: 80, minWidth: 80 }}
				showSearch
				optionFilterProp="label"
			/>
			<Input
				{...rest}
				id={id}
				type="tel"
				inputMode="numeric"
				autoComplete="tel-national"
				placeholder={normalizedPlaceholder}
				value={displayNational}
				onChange={handleNationalChange}
				disabled={disabled}
				maxLength={nationalLength + 3}
				style={{ flex: 1, minWidth: 0 }}
				suffix={
					<Tooltip title={TOOLTIP_PHONE_MSG} placement="topRight">
						<FaExclamationCircle
							style={{ color: "var(--ant-colorWarning)", cursor: "help" }}
							aria-label={TOOLTIP_PHONE_MSG}
						/>
					</Tooltip>
				}
			/>
		</Input.Group>
	)
}

export default PhoneInput

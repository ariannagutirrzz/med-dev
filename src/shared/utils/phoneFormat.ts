/** Default country code for Venezuela */
export const DEFAULT_COUNTRY_CODE = "+58"

export interface CountryOption {
	code: string
	dial: string
	name: string
	nationalLength: number
}

/** Códigos de país para el selector (dial code sin +, ej. "58") */
export const COUNTRY_PHONE_OPTIONS: CountryOption[] = [
	{ code: "58", dial: "+58", name: "Venezuela", nationalLength: 10 },
	{ code: "57", dial: "+57", name: "Colombia", nationalLength: 10 },
	{ code: "52", dial: "+52", name: "México", nationalLength: 10 },
	{ code: "54", dial: "+54", name: "Argentina", nationalLength: 10 },
	{ code: "51", dial: "+51", name: "Perú", nationalLength: 9 },
	{ code: "593", dial: "+593", name: "Ecuador", nationalLength: 9 },
	{ code: "56", dial: "+56", name: "Chile", nationalLength: 9 },
	{ code: "598", dial: "+598", name: "Uruguay", nationalLength: 8 },
	{ code: "595", dial: "+595", name: "Paraguay", nationalLength: 9 },
	{ code: "591", dial: "+591", name: "Bolivia", nationalLength: 9 },
	{ code: "1", dial: "+1", name: "EE.UU. / Canadá", nationalLength: 10 },
	{ code: "34", dial: "+34", name: "España", nationalLength: 9 },
]

const DEFAULT_COUNTRY = COUNTRY_PHONE_OPTIONS[0]

/**
 * From E.164 (e.g. +584241234567) returns { countryCode: "58", national: "4241234567" }.
 * Uses longest match so 593 is chosen before 59.
 */
export function splitE164(e164: string): { countryCode: string; national: string } {
	if (!e164?.trim()) return { countryCode: DEFAULT_COUNTRY.code, national: "" }
	const digits = e164.replace(/\D/g, "").replace(/^\+/, "")
	if (digits.length === 0) return { countryCode: DEFAULT_COUNTRY.code, national: "" }
	// Longest match first
	const sorted = [...COUNTRY_PHONE_OPTIONS].sort(
		(a, b) => b.code.length - a.code.length,
	)
	for (const c of sorted) {
		if (digits.startsWith(c.code)) {
			const national = digits.slice(c.code.length).replace(/^0+/, "")
			return { countryCode: c.code, national }
		}
	}
	return { countryCode: DEFAULT_COUNTRY.code, national: digits }
}

export function getCountryByCode(code: string): CountryOption | undefined {
	return COUNTRY_PHONE_OPTIONS.find((c) => c.code === code)
}

/**
 * Normalizes a phone string to E.164.
 * If countryCode is provided, only national digits are expected; otherwise we detect country from digits.
 */
export function parsePhoneToE164(
	phone: string,
	countryCode?: string,
): string {
	if (!phone?.trim()) return ""
	let digitsOnly = phone.replace(/\D/g, "")
	if (digitsOnly.length === 0) return ""

	if (countryCode) {
		const country = getCountryByCode(countryCode) ?? DEFAULT_COUNTRY
		if (digitsOnly.startsWith("0") && digitsOnly.length >= 8) {
			digitsOnly = digitsOnly.slice(1)
		}
		if (digitsOnly.startsWith(country.code)) return `+${digitsOnly}`
		return `+${country.code}${digitsOnly}`
	}

	// Detect country from start (longest match)
	const sorted = [...COUNTRY_PHONE_OPTIONS].sort(
		(a, b) => b.code.length - a.code.length,
	)
	if (digitsOnly.startsWith("0") && digitsOnly.length >= 10) {
		digitsOnly = digitsOnly.slice(1)
	}
	for (const c of sorted) {
		if (digitsOnly.startsWith(c.code)) {
			return `+${digitsOnly}`
		}
	}
	// Assume default country (Venezuela)
	return `+${DEFAULT_COUNTRY.code}${digitsOnly}`
}

/**
 * Formats a phone for display: "+58 4XX XXX XXXX".
 * Accepts E.164 or partial input. Uses country list to strip code.
 */
export function formatPhoneDisplay(phone: string): string {
	if (!phone?.trim()) return ""
	const e164 = parsePhoneToE164(phone)
	if (!e164) return ""
	const { countryCode, national } = splitE164(e164)
	const country = getCountryByCode(countryCode)
	const dial = country?.dial ?? `+${countryCode}`
	if (national.length <= 3) return national.length ? `${dial} ${national}` : ""
	if (national.length <= 6) return `${dial} ${national.slice(0, 3)} ${national.slice(3)}`
	return `${dial} ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6, 10)}`
}

/**
 * Validates that the phone is a valid E.164 number for a known country.
 */
export function isValidPhone(phone: string): boolean {
	const e164 = parsePhoneToE164(phone)
	if (!e164) return false
	const { countryCode, national } = splitE164(e164)
	const country = getCountryByCode(countryCode)
	if (!country) return false
	return national.replace(/\D/g, "").length >= country.nationalLength
}

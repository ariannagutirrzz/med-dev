/**
 * Format a number as currency with commas for thousands
 * @param amount - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with commas
 */
export function formatPrice(amount: number, decimals: number = 2): string {
	return new Intl.NumberFormat("en-US", {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}).format(amount)
}

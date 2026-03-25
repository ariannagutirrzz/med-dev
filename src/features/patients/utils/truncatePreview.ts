/** Shortens text for list/card previews; appends "..." when trimmed to max length. */
export function truncatePreview(
	text: string | null | undefined,
	maxChars: number,
): string {
	const s = String(text ?? "").trim()
	if (maxChars < 1) return ""
	if (s.length <= maxChars) return s
	const slice = s.slice(0, maxChars).trimEnd()
	return slice.length > 0 ? `${slice}...` : "..."
}

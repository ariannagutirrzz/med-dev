/**
 * Base URL of the patient/staff SPA (no trailing slash).
 * Used in transactional emails (verify email, password reset).
 *
 * Production: set FRONTEND_URL to your live site, e.g. https://app.example.com
 * (Your host does not infer this — it must be set, or use TRUSTED_EMAIL_LINK_ORIGINS + browser Origin.)
 */
let warnedMissingPublicUrl = false

function normalizeBaseUrl(raw: string): string {
	return raw.trim().replace(/\/+$/, "")
}

function readConfiguredFrontendUrl(): string | null {
	const keys = [
		"FRONTEND_URL",
		"CLIENT_URL",
		"APP_PUBLIC_URL",
		"PUBLIC_APP_URL",
	] as const
	for (const key of keys) {
		const v = process.env[key]?.trim()
		if (v) return normalizeBaseUrl(v)
	}
	return null
}

function parseTrustedEmailLinkOrigins(): string[] {
	const raw = process.env.TRUSTED_EMAIL_LINK_ORIGINS ?? ""
	return raw
		.split(",")
		.map((s) => normalizeBaseUrl(s))
		.filter(Boolean)
}

/**
 * Prefer env vars. If unset, use request `Origin` only when it appears in
 * TRUSTED_EMAIL_LINK_ORIGINS (comma-separated, e.g. https://app.example.com,https://www.example.com).
 */
export function getPublicFrontendUrlForRequest(
	req?: { get(name: string): string | undefined },
): string {
	const configured = readConfiguredFrontendUrl()
	if (configured) return configured

	const originRaw = req?.get("origin")?.trim()
	if (originRaw) {
		const normalizedOrigin = normalizeBaseUrl(originRaw)
		const allowed = parseTrustedEmailLinkOrigins()
		if (allowed.includes(normalizedOrigin)) {
			return normalizedOrigin
		}
	}

	return getPublicFrontendUrl()
}

export function getPublicFrontendUrl(): string {
	const configured = readConfiguredFrontendUrl()
	if (configured) return configured

	const fallback = "http://localhost:5173"

	if (process.env.NODE_ENV === "production" && !warnedMissingPublicUrl) {
		warnedMissingPublicUrl = true
		console.error(
			"[config] Email links need a public app URL. Set FRONTEND_URL=https://your-live-site.com " +
				"on the server, or set TRUSTED_EMAIL_LINK_ORIGINS to the same URL(s) so links can use the request Origin. " +
				`Until then, links default to ${fallback} and will not work for real users.`,
		)
	}

	return fallback
}

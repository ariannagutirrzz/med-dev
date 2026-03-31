/**
 * Base URL of the patient/staff SPA (no trailing slash).
 * Used in transactional emails (verify email, password reset).
 *
 * Production (set on the API server, e.g. Render → Environment):
 *   FRONTEND_URL=https://your-live-app.com
 *   or SITE_URL / WEB_URL / CLIENT_URL (same value)
 *   or TRUSTED_EMAIL_LINK_ORIGINS=https://your-live-app.com  (single URL only — then no FRONTEND_URL needed)
 */

let warnedMissingPublicUrl = false

function stripEnvQuotes(raw: string | undefined): string {
	if (!raw) return ""
	let s = raw.trim()
	if (
		(s.startsWith('"') && s.endsWith('"')) ||
		(s.startsWith("'") && s.endsWith("'"))
	) {
		s = s.slice(1, -1).trim()
	}
	return s
}

function normalizeBaseUrl(raw: string): string {
	return raw.trim().replace(/\/+$/, "")
}

function parseTrustedEmailLinkOrigins(): string[] {
	const raw = stripEnvQuotes(process.env.TRUSTED_EMAIL_LINK_ORIGINS)
	if (!raw) return []
	return raw
		.split(",")
		.map((s) => normalizeBaseUrl(stripEnvQuotes(s)))
		.filter(Boolean)
}

/**
 * Explicit env vars for the SPA URL (API host must have one of these in production).
 */
function readExplicitFrontendUrlFromEnv(): string | null {
	const keys = [
		"FRONTEND_URL",
		"SITE_URL",
		"WEB_URL",
		"CLIENT_URL",
		"APP_PUBLIC_URL",
		"PUBLIC_APP_URL",
	] as const
	for (const key of keys) {
		const v = stripEnvQuotes(process.env[key])
		if (v) return normalizeBaseUrl(v)
	}
	return null
}

/**
 * If exactly one trusted origin is configured, use it as the public app URL when no FRONTEND_URL is set.
 * (Avoids localhost links when the only frontend is listed for CORS-style trust.)
 */
function readSingleTrustedOriginAsBase(): string | null {
	const trusted = parseTrustedEmailLinkOrigins()
	if (trusted.length === 1) return trusted[0]
	return null
}

function readConfiguredFrontendUrl(): string | null {
	return readExplicitFrontendUrlFromEnv() ?? readSingleTrustedOriginAsBase()
}

/**
 * Prefer env vars. If unset, use request `Origin` when it matches TRUSTED_EMAIL_LINK_ORIGINS
 * (needed when multiple frontends are listed and no single FRONTEND_URL).
 */
export function getPublicFrontendUrlForRequest(req?: {
	get(name: string): string | undefined
}): string {
	const configured = readConfiguredFrontendUrl()
	if (configured) return configured

	const originRaw = stripEnvQuotes(req?.get("origin"))
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
			"[med-dev] Email links use localhost because no public app URL is configured. " +
				"On your API host, set FRONTEND_URL=https://<your-live-frontend> " +
				"(or SITE_URL / WEB_URL), or set TRUSTED_EMAIL_LINK_ORIGINS to a single https URL for your SPA.",
		)
	}

	return fallback
}

/** Call once after loadEnv (e.g. from index.ts) so production logs show what will be used. */
export function logEmailLinkBaseAtStartup(): void {
	if (process.env.NODE_ENV !== "production") return
	const base =
		readConfiguredFrontendUrl() ??
		"http://localhost:5173 (fallback — not configured)"
	if (base.includes("localhost") || base.includes("127.0.0.1")) {
		console.error(
			`[med-dev] EMAIL LINK BASE: ${base} — users will get broken verification links until you set FRONTEND_URL (or SITE_URL) on this server.`,
		)
	} else {
		console.log(`[med-dev] Email verification / reset links will use: ${base}`)
	}
}

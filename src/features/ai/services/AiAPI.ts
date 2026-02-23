const API_BASE =
	typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL
		? import.meta.env.VITE_API_URL
		: "http://localhost:3001/api"

/** Timeout para la petición al asistente (ms). Modelos "reasoning" pueden tardar mucho. */
const CHAT_TIMEOUT_MS = 75_000

export type ChatMessage = { role: "user" | "assistant"; content: string }

/**
 * Genera respuesta del asistente vía backend (con acceso a inventario, citas, etc.).
 * Si el backend no tiene OPENROUTER_API_KEY o falla, se puede hacer fallback al cliente (opcional).
 */
export async function generateAIResponse(
	prompt: string,
	history: ChatMessage[] = [],
): Promise<AsyncIterable<string>> {
	const token = localStorage.getItem("AUTH_TOKEN")
	const controller = new AbortController()
	const timeoutId = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS)

	const res = await fetch(`${API_BASE}/ai/chat`, {
		method: "POST",
		signal: controller.signal,
		headers: {
			"Content-Type": "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
		body: JSON.stringify({ message: prompt, history }),
	}).finally(() => clearTimeout(timeoutId))

	if (!res.ok) {
		const err = await res.json().catch(() => ({ error: res.statusText }))
		throw new Error(err.error || "Error al conectar con el asistente")
	}

	const reader = res.body?.getReader()
	if (!reader) throw new Error("No se pudo leer la respuesta")

	const decoder = new TextDecoder()
	async function* stream(): AsyncGenerator<string> {
		try {
			while (true) {
				const { done, value } = await reader.read()
				if (done) break
				yield decoder.decode(value, { stream: true })
			}
		} finally {
			reader.releaseLock()
		}
	}
	return stream()
}

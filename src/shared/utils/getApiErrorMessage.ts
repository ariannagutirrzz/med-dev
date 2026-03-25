import { isAxiosError } from "axios"

const DEFAULT_FALLBACK =
	"No se pudo completar la operación. Intenta de nuevo o revisa tu conexión."

function messageFromResponseData(data: unknown): string | undefined {
	if (data == null) return undefined
	if (typeof data === "string" && data.trim()) return data.trim()

	if (typeof data === "object") {
		const d = data as Record<string, unknown>

		const err = d.error
		if (typeof err === "string" && err.trim()) return err.trim()

		const msg = d.message
		if (typeof msg === "string" && msg.trim()) return msg.trim()
	}

	return undefined
}

/**
 * Normaliza errores de Axios/red a un mensaje legible para el usuario (español por defecto).
 */
export function getApiErrorMessage(
	error: unknown,
	fallback: string = DEFAULT_FALLBACK,
): string {
	if (isAxiosError(error)) {
		const fromBody = messageFromResponseData(error.response?.data)
		if (fromBody) return fromBody

		if (error.code === "ECONNABORTED") {
			return "La solicitud tardó demasiado. Verifica tu conexión."
		}
		if (error.message === "Network Error") {
			return "No hay conexión con el servidor. Revisa tu red."
		}
		if (error.message?.trim()) return error.message.trim()
	}

	if (error instanceof Error && error.message.trim()) {
		return error.message.trim()
	}

	return fallback
}

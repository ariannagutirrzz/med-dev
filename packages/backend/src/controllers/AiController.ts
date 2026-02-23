import type { Request, Response } from "express"
import { createAiStream } from "../services/AiService"

export async function chatStream(req: Request, res: Response) {
	const { message, history = [] } = req.body as {
		message?: string
		history?: Array<{ role: "user" | "assistant"; content: string }>
	}

	if (!message || typeof message !== "string" || !message.trim()) {
		return res.status(400).json({ error: "Se requiere el campo 'message'" })
	}

	if (!process.env.OPENROUTER_API_KEY) {
		return res.status(503).json({
			error:
				"El asistente no está configurado. Añade OPENROUTER_API_KEY en el backend.",
		})
	}

	try {
		const result = await createAiStream(message.trim(), history)
		result.pipeTextStreamToResponse(res)
	} catch (err: unknown) {
		console.error("AI chat error:", err)
		const e = err as {
			statusCode?: number
			lastError?: { statusCode?: number }
			responseBody?: string
			message?: string
		}
		const code = e?.statusCode ?? e?.lastError?.statusCode
		const body = String(e?.responseBody ?? "")
		const msg = String((err as Error)?.message ?? "")
		const isRateLimit =
			code === 429 ||
			/rate.limit|rate-limited|429/i.test(body) ||
			/rate.limit|rate-limited|429/i.test(msg)
		if (isRateLimit) {
			return res.status(503).json({
				error:
					"El asistente está muy solicitado. Espera un momento e intenta de nuevo.",
			})
		}
		return res
			.status(code && code >= 400 && code < 600 ? code : 500)
			.json({ error: "Error al generar la respuesta" })
	}
}

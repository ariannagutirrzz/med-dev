import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { streamText } from "ai"
import type { Response } from "express"
import { query } from "../db"

// Modelo gratuito. Solo el id (ej: meta-llama/llama-3.2-3b-instruct:free).
const AI_MODEL = (process.env.AI_MODEL ?? "meta-llama/llama-3.2-3b-instruct:free")
	.trim()
	.replace(/^AI_MODEL=/, "")

const openRouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY,
})

const BASE_SYSTEM = `Eres un asistente médico amigable en una unidad de pleura. Responde siempre en español, de forma natural y cercana.

Comportamiento:
- Chatea con normalidad: responde a saludos (hola, hey), despedidas, preguntas generales y conversación casual como cualquier chatbot. Sé cordial y breve.
- Si te preguntan por inventario, citas, pacientes, cirugías o datos del sistema, usa los datos que se te proporcionan más abajo para responder con información real.
- Si te preguntan algo que no está en los datos (temas médicos generales, protocolos, recomendaciones), responde con tu conocimiento. No rechaces nunca el mensaje del usuario pidiendo "formula una pregunta específica"; responde siempre de forma útil y amable.`

async function getInventoryList() {
	const result = await query(
		`SELECT id, name, category, quantity, min_stock, unit 
     FROM medical_supplies ORDER BY category, name`,
	)
	return result.rows
}

async function getLowStockList() {
	const result = await query(
		`SELECT id, name, category, quantity, min_stock, unit 
     FROM medical_supplies WHERE quantity <= min_stock ORDER BY quantity ASC`,
	)
	return result.rows
}

async function getAppointmentsSummary() {
	const date = new Date().toISOString().split("T")[0]
	const result = await query(
		`SELECT a.id, a.appointment_date, a.status, a.notes,
        u_p.name AS patient_name, u_d.name AS doctor_name
     FROM appointments a
     JOIN users u_p ON u_p.document_id = a.patient_id
     JOIN users u_d ON u_d.document_id = a.doctor_id
     WHERE a.appointment_date::date = $1::date
     ORDER BY a.appointment_date`,
		[date],
	)
	return result.rows
}

async function getPatientsSummary() {
	const result = await query(
		`SELECT COUNT(*) AS total FROM users WHERE role = 'Paciente'`,
	)
	return result.rows[0]
}

async function getSurgeriesSummary() {
	const date = new Date().toISOString().split("T")[0]
	const result = await query(
		`SELECT s.id, s.surgery_date, s.status, s.notes,
        u_p.name AS patient_name, u_d.name AS doctor_name
     FROM surgeries s
     JOIN users u_p ON u_p.document_id = s.patient_id
     JOIN users u_d ON u_d.document_id = s.doctor_id
     WHERE s.surgery_date::date = $1::date
     ORDER BY s.surgery_date`,
		[date],
	)
	return result.rows
}

/** Obtiene datos actuales de la BD e inyecta en el system prompt (sin usar tools). */
async function buildSystemWithContext(): Promise<string> {
	const [inventory, lowStock, appointments, patientsCount, surgeries] =
		await Promise.all([
			getInventoryList(),
			getLowStockList(),
			getAppointmentsSummary(),
			getPatientsSummary(),
			getSurgeriesSummary(),
		])

	const today = new Date().toLocaleDateString("es-ES", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	})

	return `${BASE_SYSTEM}

## Datos actuales del sistema (${today})

### Inventario (medical_supplies)
${inventory.length === 0 ? "No hay insumos registrados." : JSON.stringify(inventory, null, 2)}

### Insumos con stock bajo (cantidad <= mínimo)
${lowStock.length === 0 ? "Ninguno." : JSON.stringify(lowStock, null, 2)}

### Citas de hoy
${appointments.length === 0 ? "No hay citas hoy." : JSON.stringify(appointments, null, 2)}

### Total de pacientes
${JSON.stringify(patientsCount)}

### Cirugías de hoy
${surgeries.length === 0 ? "No hay cirugías hoy." : JSON.stringify(surgeries, null, 2)}

Cuando pregunten por inventario, citas, pacientes o cirugías, usa estos datos. Para saludos, conversación casual o preguntas generales, responde con naturalidad sin exigir una pregunta "específica".`
}

export async function createAiStream(
	userMessage: string,
	messages: Array<{ role: "user" | "assistant"; content: string }> = [],
): Promise<{ pipeTextStreamToResponse: (response: Response) => void }> {
	const model = openRouter(AI_MODEL)
	const contextBlock = await buildSystemWithContext()

	// Gemma 3 4B no acepta "system" (Developer instruction is not enabled).
	// Inyectamos el contexto como primer mensaje user + respuesta asistente ficticia.
	const preamble = [
		{
			role: "user" as const,
			content: `Usa el siguiente contexto solo para responder en español. No repitas el contexto.\n\n${contextBlock}`,
		},
		{
			role: "assistant" as const,
			content: "¡Hola! Soy tu asistente. Puedes saludarme, preguntarme cosas en general o consultar inventario, citas y pacientes cuando quieras.",
		},
	]

	const result = streamText({
		model,
		messages: [
			...preamble,
			...messages.map((m) => ({
				role: m.role as "user" | "assistant",
				content: m.content,
			})),
			{ role: "user", content: userMessage },
		],
	})

	return result
}

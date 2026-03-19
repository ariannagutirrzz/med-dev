import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { streamText } from "ai"
import type { Response } from "express"
import { query } from "../db.js"

// Modelo gratuito. Solo el id (ej: meta-llama/llama-3.2-3b-instruct:free).
const AI_MODEL = (
	process.env.AI_MODEL ?? "meta-llama/llama-3.2-3b-instruct:free"
)
	.trim()
	.replace(/^AI_MODEL=/, "")

const openRouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY,
})

const BASE_SYSTEM = `Eres un asistente médico amigable en una unidad de pleura. Responde siempre en español, de forma natural y cercana.

Comportamiento:
- Chatea con normalidad: responde a saludos (hola, hey), despedidas y conversación casual como cualquier chatbot. Sé cordial y breve.
- Si te preguntan por inventario, citas, pacientes, cirugías o datos del sistema, usa los datos que se te proporcionan más abajo para responder con información real.
- No respondas a preguntas que no sean en español. Si el usuario escribe en otro idioma, pídele que hable en español para poder ayudarle mejor.
- No repitas los datos del sistema a menos que te pregunten específicamente por ellos. Usa los datos solo para responder preguntas relacionadas con inventario, citas, pacientes o cirugías.
- No respondas a preguntas que no tengan relación con el ámbito médico o de la unidad de pleura. Si el usuario pregunta algo fuera de contexto, responde que estás aquí para ayudarle con temas relacionados con la unidad de pleura y la salud, y que no puedes responder a preguntas generales o de otros temas.`

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

async function getAppointmentsSummary(doctorId: string) {
	const result = await query(
		`SELECT a.id, a.appointment_date, a.status, a.notes,
               u_p.name AS patient_name, u_d.name AS doctor_name
        FROM appointments a
        JOIN users u_p ON u_p.document_id = a.patient_id
        JOIN users u_d ON u_d.document_id = a.doctor_id
        WHERE a.doctor_id = $1`,
		[doctorId],
	)
	return result.rows
}

async function getPatientsSummary() {
	const result = await query(
		`SELECT COUNT(*) AS total FROM users WHERE role = 'Paciente'`,
	)
	return result.rows[0]
}

async function getPatientsData(doctorId: string) {
	const result = await query(
		`SELECT p.* FROM patients p
             WHERE EXISTS (
                 SELECT 1 FROM medical_records mr 
                 WHERE mr.patient_id = p.document_id AND mr.doctor_id = $1
             )
             OR EXISTS (
                 SELECT 1 FROM appointments a 
                 WHERE a.patient_id = p.document_id AND a.doctor_id = $1
             )
             OR EXISTS (
                 SELECT 1 FROM surgeries s 
                 WHERE s.patient_id = p.document_id AND s.doctor_id = $1
             )
             ORDER BY p.last_name ASC`,
		[doctorId],
	)
	return result.rows
}

async function getMedicalRecords(doctorId: string) {
	const result = await query(
		`SELECT * FROM medical_records WHERE doctor_id = $1 ORDER BY created_at DESC LIMIT 20`,
		[doctorId],
	)
	return result.rows
}

async function getSurgeriesSummary() {
	const result = await query(
		`SELECT s.id, s.surgery_date, s.status, s.notes,
               u_p.name AS patient_name, u_d.name AS doctor_name
        FROM surgeries s
        JOIN users u_p ON u_p.document_id = s.patient_id
        JOIN users u_d ON u_d.document_id = s.doctor_id`,
	)
	return result.rows
}

/** Obtiene datos actuales de la BD e inyecta en el system prompt (sin usar tools). */
async function buildSystemWithContext(doctorId: string): Promise<string> {
	const [
		inventory,
		lowStock,
		appointments,
		patientsCount,
		surgeries,
		patients,
		medicalRecords,
	] = await Promise.all([
		getInventoryList(),
		getLowStockList(),
		getAppointmentsSummary(doctorId),
		getPatientsSummary(),
		getSurgeriesSummary(),
		getPatientsData(doctorId),
		getMedicalRecords(doctorId),
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

### Citas agendadas
${appointments.length === 0 ? "No hay citas agendadas." : JSON.stringify(appointments, null, 2)}

### Total de pacientes
${JSON.stringify(patientsCount)}

### Cirugías agendadas
${surgeries.length === 0 ? "No hay cirugías agendadas." : JSON.stringify(surgeries, null, 2)}

### Últimos pacientes registrados
${patients.length === 0 ? "No hay pacientes registrados." : JSON.stringify(patients, null, 2)}

### Últimos registros médicos creados
${medicalRecords.length === 0 ? "No hay registros médicos." : JSON.stringify(medicalRecords, null, 2)}

Cuando pregunten por inventario, citas, pacientes o cirugías, usa estos datos. Para saludos, conversación casual o preguntas generales, responde con naturalidad sin exigir una pregunta "específica".`
}

export async function createAiStream(
	userMessage: string,
	doctorId: string,
	messages: Array<{ role: "user" | "assistant"; content: string }> = [],
): Promise<{ pipeTextStreamToResponse: (response: Response) => void }> {
	const model = openRouter(AI_MODEL)
	const contextBlock = await buildSystemWithContext(doctorId)

	const preamble = [
		{
			role: "user" as const,
			content: `INSTRUCCIONES DE SISTEMA: 
            ${contextBlock}
            
            IMPORTANTE: Los datos de arriba son la ÚNICA verdad actual. 
            Si el historial de mensajes dice algo diferente sobre cantidades o fechas, IGNÓRALO. 
            No menciones que los datos cambiaron a menos que te lo pregunten.`,
		},
		{
			role: "assistant" as const,
			content:
				"Entendido. Utilizaré exclusivamente los datos frescos del sistema para responder.",
		},
	]

	const limitedMessages = messages.slice(-6)

	const result = streamText({
		model,
		messages: [
			...preamble,
			...limitedMessages.map((m) => ({
				role: m.role as "user" | "assistant",
				content: m.content,
			})),
			{ role: "user", content: userMessage },
		],
	})

	return result
}

import { streamText } from "ai"
import { openRouter } from "../../../config/ai"

export async function generateAIResponse(prompt: string) {
	const result = streamText({
		model: openRouter("google/gemma-3-4b-it:free"),
		messages: [
			{
				role: "user",
				content: `Instrucciones: Eres un asistente médico en una unidad de pleura. Solo ayuda con temas clínicos.\n\nPregunta: ${prompt}`,
			},
		],
	})
	return result.textStream
}

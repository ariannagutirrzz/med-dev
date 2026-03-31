import { v4 as uuidv4 } from "uuid" // Para generar nombres de archivo únicos
import { supabase } from "./supabase.js"

export class ExternalServiceError extends Error {
	status: number
	publicMessage: string

	constructor(params: {
		message: string
		publicMessage: string
		status?: number
	}) {
		super(params.message)
		this.name = "ExternalServiceError"
		this.status = params.status ?? 503
		this.publicMessage = params.publicMessage
	}
}

function inferUploadPublicMessage(error: unknown): string {
	// Common in your logs: TypeError fetch failed + cause ENOTFOUND <project>.supabase.co
	const message = error instanceof Error ? error.message : String(error)
	const anyErr = error as { cause?: unknown }
	const causeMsg =
		anyErr?.cause instanceof Error
			? anyErr.cause.message
			: String(anyErr?.cause ?? "")

	const combined = `${message} ${causeMsg}`.toLowerCase()

	if (combined.includes("enotfound") || combined.includes("getaddrinfo")) {
		return "Image upload is temporarily unavailable (network/DNS). Please try again in a moment."
	}
	if (combined.includes("fetch failed")) {
		return "Image upload failed. Please try again."
	}
	return "Image upload failed. Please try again later."
}

/**
 * Sube un archivo a un bucket de Supabase en una carpeta específica.
 * @param file Objeto del archivo proporcionado por Multer (req.file)
 * @param folder Carpeta de destino: 'profile_pictures' o 'studies'
 * @returns La URL pública del archivo subido
 */
export const uploadToSupabase = async (
	file: Express.Multer.File,
	folder: "profile_pictures" | "studies",
): Promise<string> => {
	try {
		// 1. Obtener la extensión del archivo (ej: jpg, png)
		const fileExtension = file.originalname.split(".").pop()

		// 2. Crear un nombre de archivo único (ej: a1b2c3d4...jpg)
		const fileName = `${uuidv4()}.${fileExtension}`

		// 3. Definir la ruta completa dentro del bucket
		const filePath = `${folder}/${fileName}`

		// 4. Subir el archivo al Bucket 'imagenes_citas'
		// Usamos file.buffer porque Multer está configurado con memoryStorage
		const { error } = await supabase.storage
			.from("meddev_images")
			.upload(filePath, file.buffer, {
				contentType: file.mimetype,
				upsert: false, // No sobrescribir
				cacheControl: "3600", // Configuración para el CDN
			})

		if (error) {
			console.error("Error en el upload de Supabase:", error)
			throw new ExternalServiceError({
				message: `Supabase upload failed: ${error.message}`,
				publicMessage:
					"Image upload failed. Please try again. If the problem persists, contact support.",
				status: 502,
			})
		}

		// 5. Generar la URL pública que guardaremos en la base de datos
		const {
			data: { publicUrl },
		} = supabase.storage.from("meddev_images").getPublicUrl(filePath)

		return publicUrl
	} catch (error) {
		console.error("Error en uploadToSupabase:", error)
		if (error instanceof ExternalServiceError) throw error
		throw new ExternalServiceError({
			message:
				error instanceof Error
					? error.message
					: `Supabase upload failed: ${String(error)}`,
			publicMessage: inferUploadPublicMessage(error),
			status: 503,
		})
	}
}

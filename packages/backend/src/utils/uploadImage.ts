import { v4 as uuidv4 } from "uuid" // Para generar nombres de archivo únicos
import { supabase } from "./supabase"

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
		const { data, error } = await supabase.storage
			.from("meddev_images")
			.upload(filePath, file.buffer, {
				contentType: file.mimetype,
				upsert: false, // No sobrescribir
				cacheControl: "3600", // Configuración para el CDN
			})

		if (error) {
			console.error("Error en el upload de Supabase:", error)
			throw new Error(`Error al subir archivo: ${error.message}`)
		}

		// 5. Generar la URL pública que guardaremos en la base de datos
		const {
			data: { publicUrl },
		} = supabase.storage.from("meddev_images").getPublicUrl(filePath)

		return publicUrl
	} catch (error) {
		console.error("Error en uploadToSupabase:", error)
		throw error
	}
}

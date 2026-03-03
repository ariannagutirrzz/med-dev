import type { Request, Response } from "express"
import { query } from "../db"
import { supabase } from "../utils/supabase"
import { uploadToSupabase } from "../utils/uploadImage"

export const uploadExtraImages = async (req: Request, res: Response) => {
	const { medical_record_id } = req.params
	const { title } = req.body // puede ser string o arreglo
	const files = req.files as Express.Multer.File[]

	// convert titles to array for easier handling
	const titles: string[] = []
	if (Array.isArray(title)) {
		titles.push(...title)
	} else if (typeof title === "string") {
		// puede venir como cadena separada por comas
		titles.push(title)
	}

	try {
		const inserted: unknown[] = []

		// si no hay archivos, creamos filas solo con título y url null
		if (!files || files.length === 0) {
			for (let i = 0; i < titles.length; i++) {
				const result = await query(
					`INSERT INTO medical_records_images (medical_record_id, title)
                 VALUES ($1, $2)
                 RETURNING id, title, url, created_at`,
					[medical_record_id, titles[i]],
				)
				inserted.push(result.rows[0])
			}
		} else {
			// Procesamos cada archivo
			for (let i = 0; i < files.length; i++) {
				const file = files[i]

				// subir a storage
				const imageUrl = await uploadToSupabase(file, "studies")

				const rowTitle = titles[i] || titles[0] || ""
				const result = await query(
					`INSERT INTO medical_records_images (medical_record_id, title, url)
                 VALUES ($1, $2, $3)
                 RETURNING id, title, url, created_at`,
					[medical_record_id, rowTitle, imageUrl],
				)
				inserted.push(result.rows[0])
			}
		}

		res.status(201).json({
			message: "Imágenes registradas con éxito.",
			images: inserted,
		})
	} catch (error) {
		console.error("Error en uploadExtraImages:", error)
		res.status(500).json({ error: "Error interno al procesar las imágenes." })
	}
}

export const updateExtraImage = async (req: Request, res: Response) => {
	const { id } = req.params
	const { title } = req.body
	const file = req.file as Express.Multer.File

	try {
		// 1. Obtener la data actual para tener la URL vieja
		const currentData = await query(
			`SELECT url FROM medical_records_images WHERE id = $1`,
			[id],
		)

		if (currentData.rowCount === 0) {
			return res.status(404).json({ error: "Imagen no encontrada." })
		}

		let newUrl = currentData.rows[0].url

		// 2. Si viene un archivo nuevo, borrar el anterior y subir el nuevo
		if (file) {
			const oldUrl = currentData.rows[0].url

			// --- Lógica de borrado en Supabase ---
			if (oldUrl) {
				// Extraemos el path: "https://.../storage/v1/object/public/studies/archivo.jpg" -> "archivo.jpg"
				const urlParts = oldUrl.split("/")
				const fileName = urlParts[urlParts.length - 1]

				const { error: deleteError } = await supabase.storage
					.from("studies")
					.remove([fileName])

				if (deleteError) {
					console.error(
						"Error al borrar archivo viejo de Supabase:",
						deleteError,
					)
					// Opcional: podrías decidir si continuar o frenar aquí
				}
			}
			// -------------------------------------

			newUrl = await uploadToSupabase(file, "studies")
		}

		// 3. Actualizar base de datos
		const result = await query(
			`UPDATE medical_records_images 
             SET title = COALESCE($1, title), url = $2, updated_at = NOW()
             WHERE id = $3
             RETURNING id, title, url, updated_at`,
			[title, newUrl, id],
		)

		res.json({
			message: "Registro e imagen física actualizados con éxito.",
			image: result.rows[0],
		})
	} catch (error) {
		console.error("Error en updateExtraImage:", error)
		res.status(500).json({ error: "Error interno al actualizar." })
	}
}

export const getImagesByRecord = async (req: Request, res: Response) => {
	const { medical_record_id } = req.params
	try {
		const result = await query(
			`SELECT id, title, url, created_at, updated_at FROM medical_records_images WHERE medical_record_id = $1 ORDER BY created_at`,
			[medical_record_id],
		)
		res.json({ images: result.rows })
	} catch (error) {
		console.error("Error fetching extra images:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

export const deleteExtraImage = async (req: Request, res: Response) => {
	const { id } = req.params

	try {
		// 1. Primero obtenemos la URL para saber qué archivo borrar en el Storage
		const imageData = await query(
			`SELECT url FROM medical_records_images WHERE id = $1`,
			[id],
		)

		if (imageData.rowCount === 0) {
			return res
				.status(404)
				.json({ error: "La imagen no existe en la base de datos." })
		}

		const imageUrl = imageData.rows[0].url

		// 2. Si existe una URL física, intentamos borrar del storage
		if (imageUrl) {
			// Extraemos el nombre del archivo de la URL
			const urlParts = imageUrl.split("/")
			const fileName = urlParts[urlParts.length - 1]

			const { error: storageError } = await supabase.storage
				.from("studies")
				.remove([fileName])

			if (storageError) {
				console.error("Error borrando archivo en Supabase:", storageError)
				// no detenemos la eliminación en BD
			}
		}

		// 3. Eliminamos el registro de la base de datos
		const result = await query(
			`DELETE FROM medical_records_images WHERE id = $1 RETURNING id`,
			[id],
		)

		res.json({
			message:
				"Imagen eliminada correctamente tanto del servidor como del registro.",
			deletedId: result.rows[0].id,
		})
	} catch (error) {
		console.error("Error en deleteExtraImage:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

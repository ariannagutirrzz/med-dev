import type { Request } from "express"
import multer from "multer"

// Configuramos el almacenamiento en memoria
const storage = multer.memoryStorage()

// Filtro de seguridad para aceptar solo imágenes
const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
	if (file.mimetype.startsWith("image/")) {
		cb(null, true)
	} else {
		cb(new Error("El archivo no es una imagen válida"), false)
	}
}

export const upload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024, // Límite de 5MB por imagen
	},
	fileFilter: fileFilter,
})

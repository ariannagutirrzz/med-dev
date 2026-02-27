import { Router } from "express"
import multer from "multer"
import {
	deleteExtraImage,
	getImagesByRecord,
	updateExtraImage,
	uploadExtraImages,
} from "../controllers/medicalRecordsImagesController"

const medicalRecordsImagesRouter: Router = Router()

// Configuración básica de Multer en memoria
const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB por ejemplo
})

// Ruta para añadir imágenes a una evolución específica
// 'extra_images_files' es el nombre del campo que debe enviar el FormData
medicalRecordsImagesRouter.post(
	"/:medical_record_id",
	upload.array("extra_images_files"),
	uploadExtraImages,
)

// Obtener todas las imágenes de una evolución
medicalRecordsImagesRouter.get("/record/:medical_record_id", getImagesByRecord)

// Usamos PUT o PATCH para actualizaciones
medicalRecordsImagesRouter.patch(
	"/:id",
	upload.single("extra_image_file"), // Nombre del campo en el FormData
	updateExtraImage,
)

// Ruta para borrar una imagen individual
medicalRecordsImagesRouter.delete("/:id", deleteExtraImage)

export default medicalRecordsImagesRouter

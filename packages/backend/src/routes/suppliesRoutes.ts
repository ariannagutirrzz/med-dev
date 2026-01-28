import { Router } from "express"
import {
	createSupply,
	deleteSupply,
	getAllSupplies,
	getLowStockSupplies,
	getSupplyById,
	updateSupply,
} from "../controllers/SuppliesController"
import { authenticate } from "../middleware/auth"
import { isMedic } from "../middleware/roleAuth"

/**
 * @swagger
 * /api/supplies:
 *   post:
 *     summary: Crear un insumo nuevo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 example: "COD-001"
 *               name:
 *                 type: string
 *                 example: "Paracetamol"
 *               category:
 *                 type: string
 *                 example: "Medicamentos"
 *               quantity:
 *                 type: number
 *                 example: 5
 *               min_stock:
 *                 type: number
 *                 example: 2
 *               unit:
 *                 type: string
 *                 example: "Unidad"
 *               status:
 *                 type: string
 *                 example: "available"
 *     tags:
 *     - Medical_Supplies
 *   get:
 *     summary: Obtener todos los insumos médicos
 *     tags:
 *     - Medical_Supplies
 * /api/supplies/low-stock:
 *   get:
 *     summary: Obtener todos los insumos médicos con stock bajo
 *     tags:
 *     - Medical_Supplies
 * /api/supplies/{id}:
 *   get:
 *    summary: Obtener un insumo médico por su id
 *    parameters:
 *    - in: path
 *      name: id
 *      description: ID del insumo médico
 *    tags:
 *     - Medical_Supplies
 *   patch:
 *     summary: Actualizar un insumo médico por su id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 example: "COD-001"
 *               name:
 *                 type: string
 *                 example: "Paracetamol"
 *               category:
 *                 type: string
 *                 example: "Medicamentos"
 *               quantity:
 *                 type: number
 *                 example: 5
 *               min_stock:
 *                 type: number
 *                 example: 2
 *               unit:
 *                 type: string
 *                 example: "Unidad"
 *               status:
 *                 type: string
 *                 example: "available"
 *     parameters:
 *     - in: path
 *       name: id
 *       description: Cedula del usuario
 *     tags:
 *       - Medical_Supplies
 *   delete:
 *     summary: Eliminar un insumo médico por su id
 *     parameters:
 *     - in: path
 *       name: id
 *       description: Cedula del usuario
 *     tags:
 *       - Medical_Supplies
 */

const suppliesRoutes: Router = Router()

suppliesRoutes.use(authenticate)
suppliesRoutes.use(isMedic)

suppliesRoutes.post("/", createSupply)
suppliesRoutes.get("/", getAllSupplies)
suppliesRoutes.get("/low-stock", getLowStockSupplies)
suppliesRoutes.get("/:id", getSupplyById)
suppliesRoutes.patch("/:id", updateSupply)
suppliesRoutes.delete("/:id", deleteSupply)

export default suppliesRoutes

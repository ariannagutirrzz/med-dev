import type { Request, Response } from "express"
import { query } from "../db"

// 1. Obtener todos los insumos
export const getAllSupplies = async (_req: Request, res: Response) => {
	try {
		const result = await query(
			`SELECT * FROM medical_supplies ORDER BY name ASC`,
		)
		res.json({
			supplies: result.rows,
			message: "Inventario cargado con éxito",
		})
	} catch (error) {
		console.error("Error fetching supplies:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// 2. Obtener un insumo específico por su ID (Código de suministro)
export const getSupplyById = async (req: Request, res: Response) => {
	const { id } = req.params

	try {
		const result = await query(`SELECT * FROM medical_supplies WHERE id = $1`, [
			id,
		])

		if (result.rows.length === 0) {
			return res.status(404).json({
				message: "Insumo no encontrado",
				id: id,
			})
		}

		res.json({
			supply: result.rows[0],
			message: "Insumo encontrado con éxito",
		})
	} catch (error) {
		console.error("Error fetching supply by ID:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// 3. Crear un nuevo insumo
export const createSupply = async (req: Request, res: Response) => {
	const { id, name, category, quantity, min_stock, unit, status } = req.body

	// 1. Validar que no falten campos obligatorios
	const requiredFields = [
		"id",
		"name",
		"category",
		"quantity",
		"min_stock",
		"unit",
		"status",
	]
	const missingFields = requiredFields.filter(
		(field) => !req.body[field] && req.body[field] !== 0,
	)

	if (missingFields.length > 0) {
		return res.status(400).json({
			error: `Faltan los siguientes campos: ${missingFields.join(", ")}`,
		})
	}

	// 2. Validaciones de tipo de dato y lógica
	if (typeof quantity !== "number" || quantity < 0) {
		return res
			.status(400)
			.json({ error: "La cantidad (quantity) debe ser un número positivo" })
	}

	if (typeof min_stock !== "number" || min_stock < 0) {
		return res.status(400).json({
			error: "El stock mínimo (min_stock) debe ser un número positivo",
		})
	}

	try {
		const result = await query(
			`INSERT INTO medical_supplies (id, name, category, quantity, min_stock, unit, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
			[id, name, category, quantity, min_stock, unit, status],
		)

		res.status(201).json({
			supply: result.rows[0],
			message: "Insumo registrado correctamente",
		})
	} catch (error) {
		console.error("Error creating supply:", error)
		res.status(500).json({ error: "Error interno al registrar el insumo" })
	}
}

// 4. Actualizar stock o detalles
export const updateSupply = async (req: Request, res: Response) => {
	const { id } = req.params
	const updates = req.body

	// 1. Verificar si se enviaron campos para actualizar
	const keys = Object.keys(updates)
	if (keys.length === 0) {
		return res
			.status(400)
			.json({ error: "No se proporcionaron campos para actualizar" })
	}

	// 2. Validaciones de tipo (Solo si el campo está presente en el body)
	const errors: string[] = []

	if (updates.quantity !== undefined) {
		if (typeof updates.quantity !== "number" || updates.quantity < 0) {
			errors.push("La cantidad (quantity) debe ser un número positivo")
		}
	}

	if (updates.min_stock !== undefined) {
		if (typeof updates.min_stock !== "number" || updates.min_stock < 0) {
			errors.push("El stock mínimo (min_stock) debe ser un número positivo")
		}
	}

	if (updates.id !== undefined) {
		errors.push("No se permite cambiar el código ID del insumo una vez creado")
	}

	// Si hay errores de validación, detenemos la ejecución
	if (errors.length > 0) {
		return res.status(400).json({ errors })
	}

	// 3. Construcción dinámica de la consulta SQL
	const setClause = keys
		.map((key, index) => `${key} = $${index + 1}`)
		.join(", ")

	const values = Object.values(updates)
	values.push(id) // El ID de la URL es el último parámetro

	try {
		const result = await query(
			`UPDATE medical_supplies 
             SET ${setClause}
             WHERE id = $${values.length} 
             RETURNING *`,
			values,
		)

		if (result.rowCount === 0) {
			return res.status(404).json({ error: "Insumo no encontrado" })
		}

		res.json({
			supply: result.rows[0],
			message: "Inventario actualizado con éxito",
		})
	} catch (error) {
		console.error("Error updating supply:", error)
		res.status(500).json({ error: "Error interno al actualizar el insumo" })
	}
}

// 5. Obtener insumos con poco stock (Dashboard Alert)
export const getLowStockSupplies = async (_req: Request, res: Response) => {
	try {
		const result = await query(
			`SELECT name, quantity, min_stock, unit 
             FROM medical_supplies 
             WHERE quantity <= min_stock`,
		)
		res.json({
			lowStock: result.rows,
			count: result.rowCount,
		})
	} catch (error) {
		console.error("Error fetching low stock:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

// 6. Eliminar insumo
export const deleteSupply = async (req: Request, res: Response) => {
	const { id } = req.params
	try {
		const result = await query(
			`DELETE FROM medical_supplies WHERE id = $1 RETURNING name`,
			[id],
		)
		if (result.rowCount === 0)
			return res.status(404).json({ error: "Insumo no encontrado" })

		res.json({ message: `Insumo ${result.rows[0].name} eliminado` })
	} catch (error) {
		console.error("Error deleting supply:", error)
		res.status(500).json({ error: "Internal server error" })
	}
}

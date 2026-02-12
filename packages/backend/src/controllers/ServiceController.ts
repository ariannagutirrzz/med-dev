import type { Request, Response } from "express"
import {
	createDoctorService,
	deleteDoctorService,
	getDoctorServiceById,
	getDoctorServices,
	getServiceTypeById,
	getServiceTypes,
	updateDoctorService,
} from "../services/ServiceService"

/**
 * Get all service types
 */
export const getAllServiceTypes = async (_req: Request, res: Response) => {
	try {
		const serviceTypes = await getServiceTypes()
		res.json({
			serviceTypes,
			message: "Service types fetched successfully",
		})
	} catch (error) {
		console.error("Error in getAllServiceTypes:", error)
		res.status(500).json({
			error: error instanceof Error ? error.message : "Internal server error",
		})
	}
}

/**
 * Get service type by ID
 */
export const getServiceType = async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const serviceType = await getServiceTypeById(parseInt(id, 10))

		if (!serviceType) {
			return res.status(404).json({ error: "Service type not found" })
		}

		res.json({
			serviceType,
			message: "Service type fetched successfully",
		})
	} catch (error) {
		console.error("Error in getServiceType:", error)
		res.status(500).json({
			error: error instanceof Error ? error.message : "Internal server error",
		})
	}
}

/**
 * Get all services for the authenticated doctor
 */
export const getMyServices = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: "Unauthorized: User not found" })
		}

		const { document_id: userId, role } = req.user

		if (role !== "Médico") {
			return res.status(403).json({
				error: "Only doctors can access their services",
			})
		}

		const services = await getDoctorServices(userId)
		res.json({
			services,
			message: "Doctor services fetched successfully",
		})
	} catch (error) {
		console.error("Error in getMyServices:", error)
		res.status(500).json({
			error: error instanceof Error ? error.message : "Internal server error",
		})
	}
}

/**
 * Get services for a specific doctor (for patients to view)
 */
export const getDoctorServicesByDoctorId = async (req: Request, res: Response) => {
	try {
		const { doctorId } = req.params

		const services = await getDoctorServices(doctorId)
		res.json({
			services: services.filter((s) => s.is_active),
			message: "Doctor services fetched successfully",
		})
	} catch (error) {
		console.error("Error in getDoctorServicesByDoctorId:", error)
		res.status(500).json({
			error: error instanceof Error ? error.message : "Internal server error",
		})
	}
}

/**
 * Get a specific service by ID
 */
export const getService = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: "Unauthorized: User not found" })
		}

		const { id } = req.params
		const { document_id: userId, role } = req.user

		if (role !== "Médico") {
			return res.status(403).json({
				error: "Only doctors can access their services",
			})
		}

		const service = await getDoctorServiceById(parseInt(id, 10), userId)

		if (!service) {
			return res.status(404).json({ error: "Service not found" })
		}

		res.json({
			service,
			message: "Service fetched successfully",
		})
	} catch (error) {
		console.error("Error in getService:", error)
		res.status(500).json({
			error: error instanceof Error ? error.message : "Internal server error",
		})
	}
}

/**
 * Create a new service for the authenticated doctor
 */
export const createService = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: "Unauthorized: User not found" })
		}

		const { document_id: userId, role } = req.user

		if (role !== "Médico") {
			return res.status(403).json({
				error: "Only doctors can create services",
			})
		}

		const { service_type_id, service_name, price_usd, is_active } = req.body

		if (!price_usd) {
			return res.status(400).json({
				error: "price_usd is required",
			})
		}

		if (!service_type_id && !service_name) {
			return res.status(400).json({
				error: "Either service_type_id or service_name must be provided",
			})
		}

		if (price_usd <= 0) {
			return res.status(400).json({
				error: "price_usd must be greater than 0",
			})
		}

		const service = await createDoctorService({
			doctor_id: userId,
			service_type_id: service_type_id ? parseInt(service_type_id, 10) : undefined,
			service_name: service_name || undefined,
			price_usd: parseFloat(price_usd),
			is_active: is_active !== undefined ? is_active : true,
		})

		res.status(201).json({
			service,
			message: "Service created successfully",
		})
	} catch (error) {
		console.error("Error in createService:", error)
		res.status(500).json({
			error: error instanceof Error ? error.message : "Internal server error",
		})
	}
}

/**
 * Update a service
 */
export const updateService = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: "Unauthorized: User not found" })
		}

		const { id } = req.params
		const { document_id: userId, role } = req.user

		if (role !== "Médico") {
			return res.status(403).json({
				error: "Only doctors can update services",
			})
		}

		const { price_usd, is_active } = req.body

		const updates: any = {}
		if (price_usd !== undefined) {
			if (price_usd <= 0) {
				return res.status(400).json({
					error: "price_usd must be greater than 0",
				})
			}
			updates.price_usd = parseFloat(price_usd)
		}

		if (is_active !== undefined) {
			updates.is_active = is_active
		}

		if (Object.keys(updates).length === 0) {
			return res.status(400).json({
				error: "No fields to update",
			})
		}

		const service = await updateDoctorService(
			parseInt(id, 10),
			userId,
			updates,
		)

		res.json({
			service,
			message: "Service updated successfully",
		})
	} catch (error) {
		console.error("Error in updateService:", error)
		res.status(500).json({
			error: error instanceof Error ? error.message : "Internal server error",
		})
	}
}

/**
 * Delete a service
 */
export const deleteService = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: "Unauthorized: User not found" })
		}

		const { id } = req.params
		const { document_id: userId, role } = req.user

		if (role !== "Médico") {
			return res.status(403).json({
				error: "Only doctors can delete services",
			})
		}

		await deleteDoctorService(parseInt(id, 10), userId)

		res.json({
			message: "Service deleted successfully",
		})
	} catch (error) {
		console.error("Error in deleteService:", error)
		res.status(500).json({
			error: error instanceof Error ? error.message : "Internal server error",
		})
	}
}

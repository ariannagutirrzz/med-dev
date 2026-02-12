import { query } from "../db"

export interface ServiceType {
	id: number
	name: string
	description: string | null
	category: string
	created_at: Date
	updated_at: Date | null
}

export interface DoctorService {
	id: number
	doctor_id: string
	service_type_id: number
	price_usd: number
	is_active: boolean
	created_at: Date
	updated_at: Date | null
	service_type?: ServiceType
}

export interface DoctorServiceWithType extends DoctorService {
	service_type: ServiceType
}

export interface CreateDoctorServiceInput {
	doctor_id: string
	service_type_id?: number
	service_name?: string
	price_usd: number
	is_active?: boolean
}

export interface UpdateDoctorServiceInput {
	price_usd?: number
	is_active?: boolean
}

/**
 * Get all service types
 */
export async function getServiceTypes(): Promise<ServiceType[]> {
	try {
		const result = await query(
			`SELECT * FROM service_types ORDER BY name ASC`,
		)
		return result.rows as ServiceType[]
	} catch (error) {
		console.error("Error fetching service types:", error)
		throw new Error("Failed to fetch service types")
	}
}

/**
 * Get service type by ID
 */
export async function getServiceTypeById(id: number): Promise<ServiceType | null> {
	try {
		const result = await query(
			`SELECT * FROM service_types WHERE id = $1`,
			[id],
		)
		return result.rows[0] as ServiceType || null
	} catch (error) {
		console.error("Error fetching service type:", error)
		throw new Error("Failed to fetch service type")
	}
}

/**
 * Get all services for a specific doctor
 */
export async function getDoctorServices(
	doctorId: string,
): Promise<DoctorServiceWithType[]> {
	try {
		const result = await query(
			`SELECT 
				ds.*,
				st.id as service_type_id,
				st.name as service_type_name,
				st.description as service_type_description,
				st.category as service_type_category,
				st.created_at as service_type_created_at,
				st.updated_at as service_type_updated_at
			FROM doctor_services ds
			INNER JOIN service_types st ON ds.service_type_id = st.id
			WHERE ds.doctor_id = $1
			ORDER BY st.name ASC`,
			[doctorId],
		)

		return result.rows.map((row) => ({
			id: row.id,
			doctor_id: row.doctor_id,
			service_type_id: row.service_type_id,
			price_usd: parseFloat(row.price_usd),
			is_active: row.is_active,
			created_at: row.created_at,
			updated_at: row.updated_at,
			service_type: {
				id: row.service_type_id,
				name: row.service_type_name,
				description: row.service_type_description,
				category: row.service_type_category,
				created_at: row.service_type_created_at,
				updated_at: row.service_type_updated_at,
			},
		}))
	} catch (error) {
		console.error("Error fetching doctor services:", error)
		throw new Error("Failed to fetch doctor services")
	}
}

/**
 * Get a specific doctor service by ID
 */
export async function getDoctorServiceById(
	id: number,
	doctorId: string,
): Promise<DoctorServiceWithType | null> {
	try {
		const result = await query(
			`SELECT 
				ds.*,
				st.id as service_type_id,
				st.name as service_type_name,
				st.description as service_type_description,
				st.category as service_type_category,
				st.created_at as service_type_created_at,
				st.updated_at as service_type_updated_at
			FROM doctor_services ds
			INNER JOIN service_types st ON ds.service_type_id = st.id
			WHERE ds.id = $1 AND ds.doctor_id = $2`,
			[id, doctorId],
		)

		if (result.rows.length === 0) {
			return null
		}

		const row = result.rows[0]
		return {
			id: row.id,
			doctor_id: row.doctor_id,
			service_type_id: row.service_type_id,
			price_usd: parseFloat(row.price_usd),
			is_active: row.is_active,
			created_at: row.created_at,
			updated_at: row.updated_at,
			service_type: {
				id: row.service_type_id,
				name: row.service_type_name,
				description: row.service_type_description,
				category: row.service_type_category,
				created_at: row.service_type_created_at,
				updated_at: row.service_type_updated_at,
			},
		}
	} catch (error) {
		console.error("Error fetching doctor service:", error)
		throw new Error("Failed to fetch doctor service")
	}
}

/**
 * Create or get service type by name
 */
async function createOrGetServiceType(
	name: string,
	category: string = "consultation",
): Promise<number> {
	try {
		// First, try to find existing service type
		const findResult = await query(
			`SELECT id FROM service_types WHERE name = $1`,
			[name],
		)

		if (findResult.rows.length > 0) {
			return findResult.rows[0].id
		}

		// If not found, create a new one
		const createResult = await query(
			`INSERT INTO service_types (name, category, description)
			VALUES ($1, $2, $3)
			RETURNING id`,
			[name, category, null],
		)

		return createResult.rows[0].id
	} catch (error) {
		console.error("Error creating/finding service type:", error)
		throw new Error("Failed to create or find service type")
	}
}

/**
 * Create a new doctor service
 */
export async function createDoctorService(
	input: CreateDoctorServiceInput,
): Promise<DoctorService> {
	try {
		let service_type_id: number

		// If service_name is provided, create or get the service type
		if (input.service_name) {
			service_type_id = await createOrGetServiceType(input.service_name)
		} else if (input.service_type_id) {
			service_type_id = input.service_type_id
		} else {
			throw new Error("Either service_name or service_type_id must be provided")
		}

		const result = await query(
			`INSERT INTO doctor_services (doctor_id, service_type_id, price_usd, is_active)
			VALUES ($1, $2, $3, $4)
			RETURNING *`,
			[
				input.doctor_id,
				service_type_id,
				input.price_usd,
				input.is_active ?? true,
			],
		)
		return result.rows[0] as DoctorService
	} catch (error) {
		console.error("Error creating doctor service:", error)
		if (error instanceof Error && error.message.includes("UNIQUE")) {
			throw new Error("Service already exists for this doctor")
		}
		throw error instanceof Error ? error : new Error("Failed to create doctor service")
	}
}

/**
 * Update a doctor service
 */
export async function updateDoctorService(
	id: number,
	doctorId: string,
	input: UpdateDoctorServiceInput,
): Promise<DoctorService> {
	try {
		const updates: string[] = []
		const values: any[] = []
		let paramCount = 1

		if (input.price_usd !== undefined) {
			updates.push(`price_usd = $${paramCount++}`)
			values.push(input.price_usd)
		}

		if (input.is_active !== undefined) {
			updates.push(`is_active = $${paramCount++}`)
			values.push(input.is_active)
		}

		if (updates.length === 0) {
			throw new Error("No fields to update")
		}

		updates.push(`updated_at = CURRENT_TIMESTAMP`)
		values.push(id, doctorId)

		const result = await query(
			`UPDATE doctor_services 
			SET ${updates.join(", ")}
			WHERE id = $${paramCount++} AND doctor_id = $${paramCount++}
			RETURNING *`,
			values,
		)

		if (result.rows.length === 0) {
			throw new Error("Service not found or unauthorized")
		}

		return result.rows[0] as DoctorService
	} catch (error) {
		console.error("Error updating doctor service:", error)
		throw error instanceof Error ? error : new Error("Failed to update doctor service")
	}
}

/**
 * Delete a doctor service
 */
export async function deleteDoctorService(
	id: number,
	doctorId: string,
): Promise<void> {
	try {
		const result = await query(
			`DELETE FROM doctor_services 
			WHERE id = $1 AND doctor_id = $2`,
			[id, doctorId],
		)

		if (result.rowCount === 0) {
			throw new Error("Service not found or unauthorized")
		}
	} catch (error) {
		console.error("Error deleting doctor service:", error)
		throw error instanceof Error ? error : new Error("Failed to delete doctor service")
	}
}

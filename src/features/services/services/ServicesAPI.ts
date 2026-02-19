import { isAxiosError } from "axios"
import { api } from "../../../config/axios"

export interface ServiceType {
	id: number
	name: string
	description: string | null
	category: string
	created_at: string
	updated_at: string | null
}

export interface DoctorService {
	id: number
	doctor_id: string
	service_type_id: number
	price_usd: number
	is_active: boolean
	created_at: string
	updated_at: string | null
	service_type?: ServiceType
}

export interface DoctorServiceWithType extends DoctorService {
	service_type: ServiceType
}

export interface CreateDoctorServiceInput {
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
		const { data } = await api.get<{
			serviceTypes: ServiceType[]
			message: string
		}>("/services/types")
		return data.serviceTypes
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(
				error.response.data.error || "Failed to fetch service types",
			)
		}
		throw new Error("Failed to fetch service types")
	}
}

/**
 * Get service type by ID
 */
export async function getServiceTypeById(id: number): Promise<ServiceType> {
	try {
		const { data } = await api.get<{
			serviceType: ServiceType
			message: string
		}>(`/services/types/${id}`)
		return data.serviceType
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(
				error.response.data.error || "Failed to fetch service type",
			)
		}
		throw new Error("Failed to fetch service type")
	}
}

/**
 * Get all services for the authenticated doctor
 */
export async function getMyServices(): Promise<DoctorServiceWithType[]> {
	try {
		const { data } = await api.get<{
			services: DoctorServiceWithType[]
			message: string
		}>("/services/my-services")
		return data.services
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(
				error.response.data.error || "Failed to fetch doctor services",
			)
		}
		throw new Error("Failed to fetch doctor services")
	}
}

/**
 * Get services for a specific doctor (for patients to view)
 */
export async function getDoctorServices(
	doctorId: string,
): Promise<DoctorServiceWithType[]> {
	try {
		const { data } = await api.get<{
			services: DoctorServiceWithType[]
			message: string
		}>(`/services/doctor/${doctorId}`)
		return data.services
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(
				error.response.data.error || "Failed to fetch doctor services",
			)
		}
		throw new Error("Failed to fetch doctor services")
	}
}

/**
 * Get a specific service by ID
 */
export async function getServiceById(
	id: number,
): Promise<DoctorServiceWithType> {
	try {
		const { data } = await api.get<{
			service: DoctorServiceWithType
			message: string
		}>(`/services/${id}`)
		return data.service
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(
				error.response.data.error || "Failed to fetch service",
			)
		}
		throw new Error("Failed to fetch service")
	}
}

/**
 * Create a new service
 */
export async function createService(
	input: CreateDoctorServiceInput,
): Promise<DoctorService> {
	try {
		const { data } = await api.post<{
			service: DoctorService
			message: string
		}>("/services", input)
		return data.service
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(
				error.response.data.error || "Failed to create service",
			)
		}
		throw new Error("Failed to create service")
	}
}

/**
 * Update a service
 */
export async function updateService(
	id: number,
	input: UpdateDoctorServiceInput,
): Promise<DoctorService> {
	try {
		const { data } = await api.patch<{
			service: DoctorService
			message: string
		}>(`/services/${id}`, input)
		return data.service
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(
				error.response.data.error || "Failed to update service",
			)
		}
		throw new Error("Failed to update service")
	}
}

/**
 * Delete a service
 */
export async function deleteService(id: number): Promise<void> {
	try {
		await api.delete(`/services/${id}`)
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(
				error.response.data.error || "Failed to delete service",
			)
		}
		throw new Error("Failed to delete service")
	}
}

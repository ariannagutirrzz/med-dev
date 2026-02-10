import { isAxiosError } from "axios"
import { api } from "../../../config/axios"
import type { Supply } from "../../../shared"

export async function createSupply(formData: Supply) {
	try {
		const { data } = await api.post("/supplies", formData)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
	}
}

export async function getSupplies() {
	try {
		const { data } = await api.get("/supplies")
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
	}
}

export async function getLowStockSupplies() {
	try {
		const { data } = await api.get("/supplies/low-stock")
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
	}
}

export async function getSupplyById(id: Supply["id"]) {
	try {
		const { data } = await api.get(`/supplies/${id}`)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
	}
}

export async function updateSupplyById(
	id: Supply["id"],
	formData: Partial<Supply>,
) {
	try {
		const { data } = await api.patch(`/supplies/${id}`, formData)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
	}
}

export async function deleteSupplyById(id: Supply["id"]) {
	try {
		const { data } = await api.delete(`/supplies/${id}`)
		return data
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error)
		}
	}
}

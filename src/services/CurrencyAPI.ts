import { isAxiosError } from "axios"
import { api } from "../config/axios"

export interface CurrencyRate {
	nombre: string
	promedio: number
	fechaActualizacion: string
}

export interface CurrencyRates {
	oficial: CurrencyRate
	paralelo: CurrencyRate
}

export interface CurrencyAPIResponse {
	rates: CurrencyRates
	message: string
}

/**
 * CurrencyAPI Service
 * Following DRY principle - centralized API calls for currency exchange rates
 */

/**
 * Get current currency exchange rates (Official BCV and Parallel/Black Market)
 */
export async function getCurrencyRates(): Promise<CurrencyRates> {
	try {
		const { data } = await api.get<CurrencyAPIResponse>("/currency")
		return data.rates
	} catch (error) {
		if (isAxiosError(error) && error.response) {
			throw new Error(
				error.response.data.error || "Failed to fetch currency rates",
			)
		}
		throw new Error("Failed to fetch currency rates")
	}
}

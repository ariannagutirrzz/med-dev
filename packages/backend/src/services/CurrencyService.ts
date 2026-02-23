/**
 * CurrencyService
 * Single Responsibility: Fetch currency exchange rates from DolarAPI
 * Following SOLID principles - Separation of Concerns
 */

export interface DolarAPIResponse {
	fuente: string
	nombre: string
	compra: number | null
	venta: number | null
	promedio: number
	fechaActualizacion: string
}

export interface CurrencyRates {
	oficial: {
		nombre: string
		promedio: number
		fechaActualizacion: string
	}
	paralelo: {
		nombre: string
		promedio: number
		fechaActualizacion: string
	}
}

/**
 * Fetch currency exchange rates from DolarAPI
 * Returns both official (BCV) and parallel (black market) rates
 */
export async function getCurrencyRates(): Promise<CurrencyRates> {
	try {
		const response = await fetch("https://ve.dolarapi.com/v1/dolares")

		if (!response.ok) {
			throw new Error(`DolarAPI responded with status: ${response.status}`)
		}

		const data = (await response.json()) as DolarAPIResponse[]

		// Find official rate (BCV) - first object
		const oficial = data.find((rate) => rate.fuente === "oficial")
		// Find parallel rate - second object
		const paralelo = data.find((rate) => rate.fuente === "paralelo")

		if (!oficial || !paralelo) {
			throw new Error("Required currency rates not found in API response")
		}

		return {
			oficial: {
				nombre: oficial.nombre,
				promedio: oficial.promedio,
				fechaActualizacion: oficial.fechaActualizacion,
			},
			paralelo: {
				nombre: paralelo.nombre,
				promedio: paralelo.promedio,
				fechaActualizacion: paralelo.fechaActualizacion,
			},
		}
	} catch (error) {
		console.error("Error fetching currency rates:", error)
		throw new Error(
			error instanceof Error
				? `Failed to fetch currency rates: ${error.message}`
				: "Failed to fetch currency rates",
		)
	}
}

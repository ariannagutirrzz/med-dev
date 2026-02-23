import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { getStoredToken } from "../../../config/axios"
import { getCurrencyRates, type CurrencyRates } from "../../currency"
import { getSettings, updateSettings, type UserSettings } from "../../settings"

export const useCurrencyRates = () => {
	const [loading, setLoading] = useState(true)
	const [currencyRates, setCurrencyRates] = useState<CurrencyRates | null>(
		null,
	)
	const [settings, setSettings] = useState<UserSettings | null>(null)
	const [customRateInput, setCustomRateInput] = useState("")
	const [savingCustomRate, setSavingCustomRate] = useState(false)

	useEffect(() => {
		const fetchCurrencyRates = async () => {
			try {
				setLoading(true)
				const [rates, userSettings] = await Promise.all([
					getCurrencyRates(),
					getSettings(),
				])

				setCurrencyRates(rates)
				setSettings(userSettings)

				if (
					userSettings.custom_exchange_rate != null &&
					typeof userSettings.custom_exchange_rate === "number"
				) {
					setCustomRateInput(userSettings.custom_exchange_rate.toString())
				}
			} catch (error) {
				console.error("Error fetching currency rates:", error)
				toast.error("Error al cargar las tasas de cambio")
			} finally {
				setLoading(false)
			}
		}

		fetchCurrencyRates()
		const interval = setInterval(fetchCurrencyRates, 5 * 60 * 1000)

		return () => clearInterval(interval)
	}, [])

	const handleSaveCustomRate = async () => {
		if (!customRateInput || isNaN(parseFloat(customRateInput))) {
			toast.error("Por favor ingresa un valor numérico válido")
			return
		}

		const rateValue = parseFloat(customRateInput)
		if (rateValue <= 0) {
			toast.error("La tasa debe ser mayor a 0")
			return
		}

		const token = getStoredToken()
		if (!token) {
			toast.error("Sesión expirada. Por favor inicia sesión nuevamente.")
			return
		}

		try {
			setSavingCustomRate(true)
			const updatedSettings = await updateSettings({
				custom_exchange_rate: rateValue,
			})
			setSettings(updatedSettings)

			window.dispatchEvent(
				new CustomEvent("settingsUpdated", {
					detail: { custom_exchange_rate: rateValue },
				}),
			)

			toast.success("Tasa personalizada guardada exitosamente")
		} catch (error) {
			console.error("Error saving custom rate:", error)
			const errorMessage =
				error instanceof Error
					? error.message
					: "Error al guardar la tasa personalizada"
			toast.error(errorMessage)

			if (
				errorMessage.includes("401") ||
				errorMessage.includes("No Autorizado")
			) {
				toast.error("Tu sesión ha expirado. Por favor inicia sesión nuevamente.")
			}
		} finally {
			setSavingCustomRate(false)
		}
	}

	return {
		currencyRates,
		settings,
		loading,
		customRateInput,
		setCustomRateInput,
		savingCustomRate,
		handleSaveCustomRate,
	}
}

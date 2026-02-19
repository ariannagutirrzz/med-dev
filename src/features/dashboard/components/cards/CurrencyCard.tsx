import { formatPrice } from "../../../../shared"
import { useCurrencyRates } from "../../hooks/useCurrencyRates"
import { useAuth } from "../../../auth"

export const CurrencyCard = () => {
	const { user } = useAuth()
	const {
		currencyRates,
		settings,
		loading,
		customRateInput,
		setCustomRateInput,
		savingCustomRate,
		handleSaveCustomRate,
	} = useCurrencyRates()

	return (
		<div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 min-h-[180px] sm:min-h-[220px] md:min-h-[260px] flex flex-col">
			<div className="flex flex-row justify-between items-center mb-2 sm:mb-3 md:mb-4">
				<h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-800">
					Sistema Cambiario
				</h3>
				<img
					src="/src/assets/logo.png"
					alt="Logo del banco central de venezuela"
					className="h-6 w-6 sm:h-7 sm:w-7 md:h-9 md:w-9"
				/>
			</div>
			<div className="flex-1 flex flex-col gap-2 sm:gap-3">
				{loading ? (
					<div className="flex items-center justify-center flex-1">
						<div className="animate-pulse text-gray-400 text-xs sm:text-sm">
							Cargando tasas...
						</div>
					</div>
				) : currencyRates ? (
					<>
						<div className="flex flex-row justify-between text-xs sm:text-sm md:text-base font-semibold text-gray-400 px-1 sm:px-2 md:px-4">
							<span>{currencyRates.oficial.nombre}</span>
							<span className="text-right">{formatPrice(currencyRates.oficial.promedio)}</span>
						</div>
						<div className="flex flex-row justify-between text-xs sm:text-sm md:text-base font-semibold text-gray-400 px-1 sm:px-2 md:px-4">
							<span>{currencyRates.paralelo.nombre}</span>
							<span className="text-right">{formatPrice(currencyRates.paralelo.promedio)}</span>
						</div>

						{user?.role === "Médico" && (
							<div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100 text-xs sm:text-sm text-gray-500">
								<p className="mb-1 sm:mb-2 text-xs sm:text-sm">
									Tu tasa personalizada actual:{" "}
									<span className="font-semibold text-primary">
										{settings?.custom_exchange_rate != null &&
										typeof settings.custom_exchange_rate === "number"
											? `${formatPrice(Number(settings.custom_exchange_rate))} Bs`
											: "No definida"}
									</span>
								</p>
								<div className="flex flex-col sm:flex-row gap-2 sm:items-center">
									<input
										type="number"
										min="0"
										step="0.01"
										className="w-full sm:max-w-[140px] px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
										placeholder={formatPrice(currencyRates.oficial.promedio)}
										value={customRateInput}
										onChange={(e) => setCustomRateInput(e.target.value)}
									/>
									<button
										type="button"
										onClick={handleSaveCustomRate}
										disabled={savingCustomRate}
										className="inline-flex items-center justify-center px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-colors"
									>
										{savingCustomRate ? "Guardando..." : "Guardar"}
									</button>
								</div>
							</div>
						)}
					</>
				) : (
					<div className="flex items-center justify-center flex-1">
						<span className="text-gray-400 text-xs sm:text-sm">Error al cargar tasas</span>
					</div>
				)}
			</div>
		</div>
	)
}

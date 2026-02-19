interface WelcomeSectionProps {
	userName?: string
}

export const WelcomeSection = ({ userName }: WelcomeSectionProps) => {
	return (
		<div className="lg:col-span-2 mb-4 sm:mb-6">
			<h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800">
				Bienvenida, {userName || "Usuario"}! con que te gustaría{" "}
				<b className="text-primary">comenzar</b> hoy?
			</h1>
			<p className="mt-2 sm:mt-4 text-base sm:text-lg text-gray-400 font-semibold">
				Despliega y familiarizate con cada una de las siguientes opciones, te
				ayudaremos a gestionar de manera más eficiente, fácil y rápida.
			</p>
		</div>
	)
}

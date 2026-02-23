interface WelcomeSectionProps {
	userName?: string
}

export const WelcomeSection = ({ userName }: WelcomeSectionProps) => {
	return (
		<div className="flex flex-col justify-center">
			<h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-800 leading-tight">
				Bienvenida, {userName || "Usuario"}! con que te gustaría{" "}
				<b className="text-primary">comenzar</b> hoy?
			</h1>
			<p className="mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm md:text-base lg:text-lg text-gray-400 font-semibold">
				Despliega y familiarizate con cada una de las siguientes opciones, te
				ayudaremos a gestionar de manera más eficiente, fácil y rápida.
			</p>
		</div>
	)
}

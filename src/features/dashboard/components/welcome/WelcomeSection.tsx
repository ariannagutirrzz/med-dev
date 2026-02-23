interface WelcomeSectionProps {
	userName?: string
	gender?: string
	/** Si es "Paciente", se muestra mensaje simplificado de perfil */
	role?: string
}

const welcomeWord = (gender?: string) =>
	gender === "F" ? "Bienvenida" : "Bienvenido"
const defaultUserName = (gender?: string) =>
	gender === "F" ? "Usuaria" : "Usuario"

export const WelcomeSection = ({ userName, gender, role }: WelcomeSectionProps) => {
	const isPatient = String(role ?? "").trim() === "Paciente"
	const displayName = userName || defaultUserName(gender)

	if (isPatient) {
		return (
			<div className="flex flex-col justify-center">
				<h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-800 leading-tight">
					¡Hola{displayName !== defaultUserName(gender) ? `, ${displayName}` : ""}! Aquí está la información relacionada con tu perfil
				</h1>
				<p className="mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm md:text-base lg:text-lg text-gray-400 font-semibold">
					Revisa tus citas y datos personales a continuación.
				</p>
			</div>
		)
	}

	return (
		<div className="flex flex-col justify-center">
			<h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-800 leading-tight">
				{welcomeWord(gender)}, {displayName}! con que te gustaría{" "}
				<b className="text-primary">comenzar</b> hoy?
			</h1>
			<p className="mt-2 sm:mt-3 md:mt-4 text-xs sm:text-sm md:text-base lg:text-lg text-gray-400 font-semibold">
				Despliega y familiarizate con cada una de las siguientes opciones, te
				ayudaremos a gestionar de manera más eficiente, fácil y rápida.
			</p>
		</div>
	)
}

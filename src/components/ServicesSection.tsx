import ServiceCard from "./ServiceCard"

const ServicesSection = () => {
	const services = [
		{
			title: "Personal Altamente Capacitado",
			description:
				"Equipo médico con amplia experiencia en enfermedades respiratorias.",
		},
		{
			title: "Accesibilidad y Tiempos",
			description:
				"Turnos ágiles y circuito de atención prioritaria para urgencias.",
		},
		{
			title: "Experiencia del Paciente",
			description: "Atención humana, seguimiento y soporte integral.",
		},
	]

	return (
		<section id="services" className="py-8">
			<div className="max-w-6xl mx-auto px-4 grid gap-4 grid-cols-1 md:grid-cols-3">
				{services.map((service) => (
					<ServiceCard
						key={service.title}
						title={service.title}
						description={service.description}
					/>
				))}
			</div>
		</section>
	)
}

export default ServicesSection


import { FaBolt, FaCheckCircle, FaUsers } from "react-icons/fa"
import FeatureCard from "./FeatureCard"

const AboutSection = () => {
	const features = [
		{
			icon: FaCheckCircle,
			title: "Personal Altamente Capacitado",
			description:
				"Evaluamos al paciente de forma global, integrando antecedentes, estudios de imagen y laboratorio para un diagnóstico completo.",
			color: "primary" as const,
		},
		{
			icon: FaUsers,
			title: "Acompañamiento Cercano",
			description:
				"Acompañamos a cada paciente y su familia en cada etapa del proceso diagnóstico y terapéutico con comunicación clara y empática.",
			color: "secondary" as const,
		},
		{
			icon: FaBolt,
			title: "Accesibilidad y Tiempos",
			description:
				"Ofrecemos turnos rápidos y un circuito de atención prioritaria para casos urgentes, garantizando acceso oportuno a la atención médica especializada cuando más la necesitas.",
			color: "primary" as const,
		},
	]

	return (
		<section
			id="about"
			className="py-16 bg-linear-to-br from-secondary-soft via-bg to-text/30"
		>
			<div className="max-w-6xl mx-auto px-4">
				<div className="text-center mb-12">
					<p className="text-sm font-semibold uppercase tracking-wide text-secondary mb-3">
						Sobre Nosotros
					</p>
					<h2 className="text-3xl md:text-4xl font-extrabold text-primary-dark mb-4">
						Cuidamos tu respiración con experiencia y calidez humana
					</h2>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					{features.map((feature) => (
						<FeatureCard
							key={feature.title}
							icon={feature.icon}
							title={feature.title}
							description={feature.description}
							color={feature.color}
						/>
					))}
				</div>
			</div>
		</section>
	)
}

export default AboutSection

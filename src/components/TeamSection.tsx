import draNinive from "../assets/dra-ninive.jpg"
import TeamCard from "./TeamCard"

const TeamSection = () => {
	const teamMembers = [
		{
			name: "Dra. Ninive Azuaje",
			title: "Especialista en Enfermedades Respiratorias",
			credentials: "MD, Neumóloga",
			experience: "Más de 15 años de experiencia",
			description:
				"Especializada en el diagnóstico y tratamiento de enfermedades de la pleura y vías respiratorias. Comprometida con la atención personalizada y el bienestar de cada paciente.",
			image: draNinive,
		},
		{
			name: "Dr. Carlos Mendoza",
			title: "Neumólogo Intervencionista",
			credentials: "MD, Neumólogo",
			experience: "Más de 12 años de experiencia",
			description:
				"Experto en procedimientos mínimamente invasivos para el diagnóstico y tratamiento de enfermedades pulmonares. Enfoque en técnicas avanzadas y tecnología de vanguardia.",
			image: draNinive,
		},
		{
			name: "Dra. María González",
			title: "Especialista en Cuidados Respiratorios",
			credentials: "MD, Neumóloga Pediátrica",
			experience: "Más de 10 años de experiencia",
			description:
				"Dedicada al cuidado respiratorio de pacientes pediátricos y adultos jóvenes. Comprometida con la educación del paciente y su familia para un mejor manejo de las condiciones respiratorias.",
			image: draNinive,
		},
	]

	return (
		<section id="team" className="py-16 bg-bg">
			<div className="max-w-6xl mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl font-bold text-primary-dark mb-4">
						Nuestro Equipo
					</h2>
					<p className="text-muted text-lg">
						Profesionales altamente capacitados dedicados a tu salud
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{teamMembers.map((member) => (
						<TeamCard
							key={member.name}
							name={member.name}
							title={member.title}
							credentials={member.credentials}
							experience={member.experience}
							description={member.description}
							image={member.image}
						/>
					))}
				</div>
			</div>
		</section>
	)
}

export default TeamSection

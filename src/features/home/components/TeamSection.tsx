import { useEffect, useState } from "react"
import TeamCard from "./TeamCard"

const TeamSection = () => {
	const [medicos, setMedicos] = useState<Medico[]>([])
	interface Medico {
		name: string
		title: string
		credentials: string
		experience: string
		description: string
		image: string
	}

	useEffect(() => {
		fetch("http://localhost:3001/medicos")
			.then((res) => res.json())
			.then((data) => setMedicos(data.medicos))
			.catch((error) => console.error("Error fetching medicos:", error))
	}, [])

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
					{medicos.map((member) => (
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

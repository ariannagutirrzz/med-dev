import { useEffect, useState } from "react"
import { getDoctors } from "../../patients/services/UsersAPI"
import imgDraNinive from '../../../assets/dra-ninive.jpg'
import imgDrCarlosOlivares from '../../../assets/dra-ninive.jpg'
import TeamCard from "./TeamCard"

interface Medico {
	name: string
	title: string
	credentials: string
	experience: string
	description: string
	image: string
}

const TeamSection = () => {
	const [medicos, setMedicos] = useState<Medico[]>([])

	const doctorImages: Record<string, string> = {
    "Dra. Ninive Azuaje": imgDraNinive,
	"Dr. Carlos Olivares": imgDrCarlosOlivares,
};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await getDoctors()
				setMedicos(data.doctors)
			} catch (error) {
				console.error("Error al cargar el equipo médico:", error)
			}
		}

		fetchData()
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

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
    {medicos.map((member) => {
        const imageSrc = doctorImages[member.name]

        return (
            <TeamCard
                key={member.name}
                name={member.name}
                title={member.title}
                credentials={member.credentials}
                experience={member.experience}
                description={member.description}
                image={imageSrc}
            />
        );
    })}
</div>
			</div>
		</section>
	)
}

export default TeamSection

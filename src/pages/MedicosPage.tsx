import { useState, useEffect } from "react"
import TeamCard from "../components/TeamCard"

interface Medico {
	name: string
	title: string
	credentials: string
	experience: string
	description: string
	image: string
}

const MedicosPage = () => {
	const [medicos, setMedicos] = useState<Medico[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetch("http://localhost:3001/medicos")
			.then((res) => res.json())
			.then((data) => {
				setMedicos(data.medicos)
				setLoading(false)
			})
			.catch((error) => {
				console.error("Error fetching medicos:", error)
				setLoading(false)
			})
	}, [])

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-lg text-gray-600">Cargando...</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-bg py-16">
			<div className="max-w-6xl mx-auto px-4">
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-primary-dark mb-4">
						Nuestro Equipo Médico
					</h1>
					<p className="text-muted text-lg">
						Profesionales altamente capacitados dedicados a tu salud
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{medicos.length > 0 ? (
						medicos.map((member) => (
							<TeamCard
								key={member.name}
								name={member.name}
								title={member.title}
								credentials={member.credentials}
								experience={member.experience}
								description={member.description}
								image={member.image}
							/>
						))
					) : (
						<div className="col-span-full text-center text-gray-500">
							No hay médicos disponibles
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default MedicosPage



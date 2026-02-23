import { useState } from "react"
import { FaChevronRight } from "react-icons/fa"
import TreatmentCard from "./TreatmentCard"

const TreatmentsSection = () => {
	const treatments = [
		{
			title: "Toracoscopia",
			description:
				"Procedimiento mínimamente invasivo para el diagnóstico y tratamiento de enfermedades pulmonares. Permite visualización directa de la cavidad pleural con mínima invasión.",
			conditions: [
				"Derrame pleural",
				"Neumotórax",
				"Tumores pleurales",
				"Enfermedades pleurales benignas",
				"Tumores pulmonares",
			],
		},
		{
			title: "Biopsia Pleural",
			description:
				"Técnica diagnóstica para obtener muestras de tejido pleural y determinar la causa de enfermedades pleurales. Procedimiento seguro y guiado por imagen.",
			conditions: [
				"Derrame pleural de origen desconocido",
				"Tumores pleurales",
				"Enfermedades inflamatorias",
			],
		},
		{
			title: "Drenaje Pleural",
			description:
				"Procedimiento para evacuar líquido o aire de la cavidad pleural, aliviando síntomas respiratorios y mejorando la función pulmonar del paciente.",
			conditions: ["Derrame pleural", "Neumotórax", "Empiema", "Hemotórax"],
		},
		{
			title: "Pleurodesis",
			description:
				"Tratamiento para prevenir la recurrencia de derrame pleural o neumotórax mediante la adhesión de las capas pleurales. Procedimiento efectivo y seguro.",
			conditions: [
				"Neumotórax recurrente",
				"Derrame pleural recurrente",
				"Derrame pleural maligno",
			],
		},
		{
			title: "Ecografía Torácica",
			description:
				"Técnica de imagen no invasiva para evaluar la pleura y el pulmón. Permite diagnóstico preciso y guía para procedimientos intervencionistas.",
			conditions: [
				"Evaluación de derrame pleural",
				"Guía para procedimientos",
				"Diagnóstico de enfermedades pleurales",
			],
		},
		{
			title: "Tratamiento de Cáncer de Pulmón",
			description:
				"Atención integral para pacientes con cáncer de pulmón, incluyendo diagnóstico, estadificación, y coordinación de tratamientos multidisciplinarios.",
			conditions: [
				"Cáncer de pulmón",
				"Metástasis pleurales",
				"Tumores pulmonares",
			],
		},
	]

	const [currentIndex, setCurrentIndex] = useState(0)

	const nextTreatment = () => {
		setCurrentIndex((prev) => (prev + 1) % treatments.length)
	}

	// const prevTreatment = () => {
	// 	setCurrentIndex(
	// 		(prev) => (prev - 1 + treatments.length) % treatments.length,
	// 	)
	// }

	const goToTreatment = (index: number) => {
		setCurrentIndex(index)
	}

	return (
		<section id="treatments" className="py-16 bg-bg">
			<div className="max-w-4xl mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl font-bold text-primary-dark mb-4">
						Servicios y Tratamientos
					</h2>
					<p className="text-muted text-lg">
						Ofrecemos una amplia gama de procedimientos especializados para el
						diagnóstico y tratamiento de enfermedades respiratorias
					</p>
				</div>

				<div>
					{/* Treatment Card Container with Navigation */}
					<div className="relative">
						{/* <button
						type="button"
						onClick={prevTreatment}
						className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-primary text-white rounded-full p-3 hover:bg-primary-dark transition-colors shadow-lg"
						aria-label="Tratamiento anterior"
					>
						<FaChevronLeft className="w-5 h-5" />
					</button> */}
						{/* Navigation Arrows */}
						<button
							type="button"
							onClick={nextTreatment}
							className="absolute cursor-pointer right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-primary text-red-600 rounded-full p-3 hover:bg-primary-dark hover:shadow-[0_14px_30px_rgba(120,154,97,0.25)] transition-all duration-300 shadow-lg"
							aria-label="Siguiente tratamiento"
						>
							<FaChevronRight className="w-5 h-5" />
						</button>

						{/* Treatment Card */}
						<div className="transition-all duration-300 ease-in-out">
							<TreatmentCard
								title={treatments[currentIndex].title}
								description={treatments[currentIndex].description}
								conditions={treatments[currentIndex].conditions}
							/>
						</div>
					</div>

					{/* Dots Indicator */}
					<div className="flex justify-center items-center gap-2 mt-6">
						{treatments.map((treatment, index) => (
							<button
								key={treatment.title}
								type="button"
								onClick={() => goToTreatment(index)}
								className={`h-3 rounded-full transition-all duration-300 ${
									index === currentIndex
										? "bg-primary w-8"
										: "bg-muted w-3 hover:bg-primary/70"
								}`}
								aria-label={`Ir al tratamiento ${index + 1}`}
							/>
						))}
					</div>

					{/* Treatment Counter */}
					{/* <div className="text-center mt-4 text-sm text-muted">
						{currentIndex + 1} de {treatments.length}
					</div> */}
				</div>
			</div>
		</section>
	)
}

export default TreatmentsSection

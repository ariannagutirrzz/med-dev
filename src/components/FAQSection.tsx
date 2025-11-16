import FAQItem from "./FAQItem"

const FAQSection = () => {
	const faqs = [
		{
			question: "¿Qué es la Unidad de Pleura?",
			answer:
				"La Unidad de Pleura es un centro especializado en el diagnóstico y tratamiento de enfermedades relacionadas con la pleura y el sistema respiratorio. Ofrecemos atención integral con tecnología de vanguardia y un equipo médico altamente capacitado.",
		},
		{
			question: "¿Cómo puedo agendar una cita?",
			answer:
				"Puedes agendar una cita a través de nuestro sistema en línea después de iniciar sesión, o contactarnos directamente por teléfono al +58 412 123 4567. Nuestro horario de atención es de lunes a viernes de 9:00 AM a 6:00 PM, y sábados de 9:00 AM a 1:00 PM.",
		},
		{
			question: "¿Qué condiciones tratamos?",
			answer:
				"Tratamos diversas condiciones respiratorias incluyendo derrame pleural, neumotórax, enfermedades pleurales, cáncer de pulmón, EPOC, asma, y otras enfermedades del sistema respiratorio. Nuestro equipo está especializado en el manejo integral de estas condiciones.",
		},
		{
			question: "¿Cuánto tiempo toma una consulta?",
			answer:
				"Una consulta inicial típicamente toma entre 45 minutos a 1 hora, permitiendo tiempo suficiente para una evaluación completa, revisión de historial médico, y discusión del plan de tratamiento. Las consultas de seguimiento suelen ser más breves.",
		},
		{
			question: "¿Aceptan seguros médicos?",
			answer:
				"Sí, trabajamos con la mayoría de las compañías de seguros médicos principales. Te recomendamos contactarnos antes de tu cita para verificar la cobertura de tu seguro y los procedimientos de autorización necesarios.",
		},
		{
			question: "¿Qué debo traer a mi primera consulta?",
			answer:
				"Para tu primera consulta, por favor trae: identificación, historial médico previo, resultados de exámenes recientes (radiografías, análisis de sangre, etc.), y una lista de medicamentos actuales que estés tomando.",
		},
	]

	return (
		<section id="faq" className="py-16 bg-bg">
			<div className="max-w-6xl mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl font-bold text-primary-dark mb-4">
						Preguntas Frecuentes
					</h2>
					<p className="text-muted text-lg">
						Encuentra respuestas a las preguntas más comunes sobre nuestros
						servicios
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
					{faqs.map((faq) => (
						<FAQItem
							key={faq.question}
							question={faq.question}
							answer={faq.answer}
						/>
					))}
				</div>
			</div>
		</section>
	)
}

export default FAQSection

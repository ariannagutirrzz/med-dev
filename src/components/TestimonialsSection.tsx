import TestimonialCard from "./TestimonialCard"

const TestimonialsSection = () => {
	// This section should we filled with real testimonials from patients (they can leave a testimonial once the treatment is finished, (from the panel once they are registered)

	const testimonials = [
		{
			name: "María Rodríguez",
			condition: "Derrame Pleural",
			rating: 5,
			comment:
				"Excelente atención desde el primer día. El equipo médico fue muy profesional y me explicaron todo el proceso de manera clara. Me siento mucho mejor después del tratamiento.",
		},
		{
			name: "Carlos Méndez",
			condition: "Neumotórax",
			rating: 5,
			comment:
				"La Dra. Ninive y su equipo me brindaron un cuidado excepcional. El procedimiento fue rápido y sin complicaciones. Definitivamente recomiendo la Unidad de Pleura.",
		},
		{
			name: "Ana Martínez",
			condition: "Cáncer de Pulmón",
			rating: 5,
			comment:
				"Encontré un equipo humano y profesional que me acompañó en todo momento. La atención fue integral y siempre me sentí escuchada. Muy agradecida con todo el personal.",
		},
		{
			name: "José González",
			condition: "Enfermedad Pleural",
			rating: 5,
			comment:
				"Procedimiento realizado con mucha precisión. El seguimiento post-tratamiento fue excelente. Me recuperé completamente gracias a su atención especializada.",
		},
		{
			name: "Laura Fernández",
			condition: "Derrame Pleural Recurrente",
			rating: 5,
			comment:
				"Después de varios intentos en otros lugares, finalmente encontré la solución aquí. El equipo es muy competente y el trato es humano. Muy satisfecha con los resultados.",
		},
		{
			name: "Roberto Sánchez",
			condition: "Neumotórax Recurrente",
			rating: 5,
			comment:
				"Profesionales de primer nivel. El procedimiento de pleurodesis fue exitoso y ya no he tenido recurrencias. Excelente experiencia en todos los aspectos.",
		},
	]

	return (
		<section id="testimonials" className="py-16 bg-bg">
			<div className="max-w-6xl mx-auto px-4">
				<div className="text-center mb-12">
					<h2 className="text-3xl font-bold text-primary-dark mb-4">
						Testimonios de Pacientes
					</h2>
					<p className="text-muted text-lg">
						Conoce las experiencias de nuestros pacientes y su camino hacia la
						recuperación
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{testimonials.map((testimonial) => (
						<TestimonialCard
							key={testimonial.name}
							name={testimonial.name}
							condition={testimonial.condition}
							rating={testimonial.rating}
							comment={testimonial.comment}
						/>
					))}
				</div>
			</div>
		</section>
	)
}

export default TestimonialsSection

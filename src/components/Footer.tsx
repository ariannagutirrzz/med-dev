import { FaInstagram, FaWhatsapp } from "react-icons/fa"

const Footer = () => {
	const currentYear = new Date().getFullYear()

	return (
		<footer className="bg-primary text-white mt-16">
			<div className="max-w-6xl mx-auto px-4 py-12">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
					{/* About Section */}
					<div>
						<h3 className="text-xl font-bold mb-4 text-white">
							Unidad de Pleura
						</h3>
						<p className="text-muted-light text-sm leading-relaxed">
							Atención especializada en enfermedades respiratorias con un
							enfoque humano y profesional.
						</p>
					</div>

					{/* Quick Links */}
					<div>
						<h3 className="text-xl font-bold mb-4 text-white">
							Enlaces Rápidos
						</h3>
						<ul className="space-y-2">
							<li>
								<a
									href="#about"
									className="text-muted-light hover:text-white transition-colors text-sm"
								>
									Sobre Nosotros
								</a>
							</li>
							<li>
								<a
									href="#services"
									className="text-muted-light hover:text-white transition-colors text-sm"
								>
									Ventajas
								</a>
							</li>
							<li>
								<a
									href="#schedule"
									className="text-muted-light hover:text-white transition-colors text-sm"
								>
									Agendar Cita
								</a>
							</li>
							<li>
								<a
									href="#contact"
									className="text-muted-light hover:text-white transition-colors text-sm"
								>
									Contáctanos
								</a>
							</li>
						</ul>
					</div>

					{/* Contact Info */}
					<div>
						<h3 className="text-xl font-bold mb-4 text-white">Contacto</h3>
						<ul className="space-y-3 text-sm text-muted-light">
							<li>
								<p className="font-semibold text-white mb-1">
									Horario de Atención
								</p>
								<p>Lunes a Viernes: 9:00 AM - 6:00 PM</p>
								<p>Sábados: 9:00 AM - 1:00 PM</p>
							</li>
							<li>
								<p className="font-semibold text-white mb-1">Emergencias</p>
								<p>Disponible 24/7 para casos urgentes</p>
							</li>
						</ul>
					</div>

					{/* Social Media */}
					<div>
						<h3 className="text-xl font-bold mb-4 text-white">Síguenos</h3>
						<p className="text-muted-light text-sm mb-4">
							Conéctate con nosotros a través de nuestras redes sociales
						</p>
						<div className="flex gap-4">
							<a
								href="https://www.instagram.com/dra.niniveazuaje?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
								target="_blank"
								rel="noopener noreferrer"
								className="bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
								aria-label="Síguenos en Instagram"
							>
								<FaInstagram className="w-6 h-6" />
							</a>
							<a
								href="https://wa.me/1234567890"
								target="_blank"
								rel="noopener noreferrer"
								className="bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors"
								aria-label="Contáctanos por WhatsApp"
							>
								<FaWhatsapp className="w-6 h-6" />
							</a>
						</div>
					</div>
				</div>

				{/* Copyright */}
				<div className="border-t border-white/20 pt-8 mt-8">
					<div className="flex flex-col md:flex-row justify-between items-center gap-4">
						<p className="text-muted-light text-sm">
							© {currentYear} Unidad de Pleura. Todos los derechos reservados.
						</p>
						<div className="flex gap-6 text-sm">
							<a
								href="#privacy"
								className="text-muted-light hover:text-white transition-colors"
							>
								Política de Privacidad
							</a>
							<a
								href="#terms"
								className="text-muted-light hover:text-white transition-colors"
							>
								Términos de Uso
							</a>
						</div>
					</div>
				</div>
			</div>
		</footer>
	)
}

export default Footer

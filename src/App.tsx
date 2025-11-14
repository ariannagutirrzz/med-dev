import draNinive from "./assets/dra-ninive.jpg"
import AboutSection from "./components/AboutSection"
import Footer from "./components/Footer"
import NavBar from "./components/NavBar"

function App() {
	return (
		<div className="min-h-screen">
			<NavBar />

			<main>
				<section className="py-14 bg-linear-to-b from-[#e6f2f2] to-[#f6fbfb]">
					<div className="max-w-6xl mx-auto px-4 flex gap-8 items-center flex-col-reverse md:flex-row">
						<div className="flex-1">
							<h1 className="text-4xl md:text-5xl font-extrabold text-[#23453a] mb-2">
								Unidad de Pleura
							</h1>
							<p className="text-[#7b8b87] mb-5">
								Atención especializada, tiempos ágiles y cuidado humano
							</p>

							<div className="flex items-center gap-3">
								<a
									className="px-5 py-3 rounded-lg bg-[#789a61] text-white font-bold"
									href="#schedule"
								>
									Agenda Tu Cita Aquí
								</a>
							</div>
						</div>

						<div className="flex-1 flex justify-center" aria-hidden="true">
							<div className="w-80 h-66 bg-linear-to-br from-white to-[#f5fafb] rounded-xl overflow-hidden shadow-lg">
								<img
									className="w-full h-full object-cover"
									src={draNinive}
									alt="Dr. Ninive Azuaje"
								/>
							</div>
						</div>
					</div>
				</section>
				<AboutSection />

				<section id="services" className="py-8">
					<div className="max-w-6xl mx-auto px-4 grid gap-4 grid-cols-1 md:grid-cols-3">
						<div className="bg-white p-4 rounded-xl shadow">
							<h3 className="font-semibold mb-2">
								Personal Altamente Capacitado
							</h3>
							<p>
								Equipo médico con amplia experiencia en enfermedades
								respiratorias.
							</p>
						</div>
						<div className="bg-white p-4 rounded-xl shadow">
							<h3 className="font-semibold mb-2">Accesibilidad y Tiempos</h3>
							<p>
								Turnos ágiles y circuito de atención prioritaria para urgencias.
							</p>
						</div>
						<div className="bg-white p-4 rounded-xl shadow">
							<h3 className="font-semibold mb-2">Experiencia del Paciente</h3>
							<p>Atención humana, seguimiento y soporte integral.</p>
						</div>
					</div>
				</section>
			</main>

			<Footer />
		</div>
	)
}

export default App

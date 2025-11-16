import draNinive from "./assets/dra-ninive.jpg"
import AboutSection from "./components/AboutSection"
import FAQSection from "./components/FAQSection"
import Footer from "./components/Footer"
import NavBar from "./components/NavBar"
import ServicesSection from "./components/ServicesSection"
import TeamSection from "./components/TeamSection"
import TreatmentsSection from "./components/TreatmentsSection"

function App() {
	return (
		<div className="min-h-screen">
			<NavBar />

			<main>
				<section className="py-14 bg-linear-to-b from-bg-light to-bg">
					<div className="max-w-6xl mx-auto px-4 flex gap-8 items-center flex-col-reverse md:flex-row">
						<div className="flex-1">
							<h1 className="text-4xl md:text-5xl font-extrabold text-primary-dark mb-2">
								Unidad de Pleura
							</h1>
							<p className="text-muted mb-5">
								Atención especializada, tiempos ágiles y cuidado humano
							</p>

							<div className="flex items-center gap-3">
								<a
									className="px-5 py-3 rounded-lg bg-primary text-white font-bold"
									href="#schedule"
								>
									Agenda Tu Cita Aquí
								</a>
							</div>
						</div>

						<div className="flex-1 flex justify-center" aria-hidden="true">
							<div className="w-80 h-66 bg-linear-to-br from-white to-bg-card rounded-xl overflow-hidden shadow-lg">
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
				<ServicesSection />
				<TeamSection />
				<TreatmentsSection />
				<FAQSection />
			</main>

			<Footer />
		</div>
	)
}

export default App

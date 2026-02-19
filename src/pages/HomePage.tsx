import { Link } from "react-router-dom"
import draNinive from "../assets/dra-ninive.jpg"
import {
	AboutSection,
	FAQSection,
	Footer,
	NavBar,
	TeamSection,
	TreatmentsSection,
} from "../features/home"

const HomePage = () => {
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
								<Link
									to="/login"
									className="px-5 py-3 rounded-lg bg-primary text-white font-bold shadow-md hover:shadow-[0_12px_24px_rgba(120,154,97,0.4)] transition-shadow duration-300 ease-in-out"
								>
									Agenda Tu Cita Aquí
								</Link>
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
				<TreatmentsSection />
				<TeamSection />
				<FAQSection />
			</main>

			<Footer />
		</div>
	)
}

export default HomePage

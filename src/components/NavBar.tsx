import logoUnidadPleura from "../assets/logo-unidad-de-pleura.png"

const NavBar = () => {
	return (
		<header className="bg-transparent py-4">
			<div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="w-40 h-10 flex items-center justify-center">
						<img src={logoUnidadPleura} alt="Unidad de Pleura" />
					</div>
				</div>

				<nav className="flex items-center">
					<a
						className="hidden md:inline-block ml-4 text-[#556b62] font-semibold"
						href="#about"
					>
						Sobre Nosotros
					</a>
					<a
						className="hidden md:inline-block ml-4 text-[#556b62] font-semibold"
						href="#services"
					>
						Ventajas
					</a>
					<a
						className="hidden md:inline-block ml-4 text-[#556b62] font-semibold"
						href="#contact"
					>
						Contáctanos
					</a>
					<a
						className="ml-4 px-3 py-2 rounded-md bg-[#789a61] border border-[rgba(0,0,0,0.06)] font-semibold text-white"
						href="#login"
					>
						Iniciar Sesión
					</a>
				</nav>
			</div>
		</header>
	)
}

export default NavBar

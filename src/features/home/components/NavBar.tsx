import { Link } from "react-router-dom"
import logoUnidadPleura from "../../../assets/logo-unidad-de-pleura.png"

const NavBar = () => {
	const navItems = [
		{
			label: "Sobre Nosotros",
			href: "#about",
		},
		{
			label: "Ventajas",
			href: "#services",
		},
		{
			label: "Contáctanos",
			href: "#contact",
		},
	]

	return (
		<header className="bg-transparent py-4">
			<div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
				<Link to="/" className="flex items-center gap-3">
					<div className="w-40 h-10 flex items-center justify-center">
						<img src={logoUnidadPleura} alt="Unidad de Pleura" />
					</div>
				</Link>

				<nav className="flex items-center">
					{navItems.map((item) => (
						<a
							key={item.href}
							href={item.href}
							className="hidden md:inline-block ml-4 text-text font-semibold"
						>
							{item.label}
						</a>
					))}
					<Link
						to="/login"
						className="ml-4 px-3 py-2 rounded-md bg-primary font-semibold text-white shadow-sm hover:shadow-[0_12px_24px_rgba(120,154,97,0.4)] transition-shadow duration-300 ease-in-out"
					>
						Iniciar Sesión
					</Link>
				</nav>
			</div>
		</header>
	)
}

export default NavBar

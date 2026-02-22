import { useCallback, useEffect, useState } from "react"
import { CiCalendar, CiHome, CiSettings, CiUser } from "react-icons/ci"
import { FaChartBar, FaDollarSign } from "react-icons/fa"
import { GiArtificialIntelligence, GiMedicalDrip } from "react-icons/gi"
import { MdOutlineInventory2 } from "react-icons/md"
import { useLocation, useNavigate } from "react-router-dom"
import { GenerateAI } from "../features/ai"
import { AppointmentsSection } from "../features/appointments"
import { useAuth } from "../features/auth"
import {
	Dashboard,
	DashboardHome,
	DashboardSearchProvider,
} from "../features/dashboard"
import { Inventory } from "../features/inventory"
import { MedicalRecords } from "../features/patients"
import { ReportsSection } from "../features/reports"
import { ServicesManagement } from "../features/services"
import { Settings } from "../features/settings"
import { SurgeriesSection } from "../features/surgeries"

const DashboardPage: React.FC = () => {
	const { user, logout, refreshUser } = useAuth()
	const navigate = useNavigate()
	const location = useLocation()
	// En móvil empezar con el menú cerrado; en desktop abierto
	const [isSidebarOpen, setIsSidebarOpen] = useState(
		() => typeof window !== "undefined" && window.innerWidth >= 768,
	)

	const userData = {
		name: user?.name || "Usuario",
		role: user?.role || "Médico Especialista - Unidad de Pleura",
		image: user?.image,
	}

	// Mapeo de rutas a IDs de menú
	const routeToMenuItemId: Record<string, string> = {
		"/dashboard/home": "home",
		"/dashboard/pacientes": "patients",
		"/dashboard/citas": "appointments",
		"/dashboard/sala-de-cirugia": "surgeryRoom",
		"/dashboard/inventario": "inventory",
		"/dashboard/servicios": "services",
		"/dashboard/reportes": "reports",
		"/dashboard/asistente-ia": "ai",
		"/dashboard/configuracion": "settings",
	}

	// Mapeo de IDs de menú a rutas
	const menuItemIdToRoute: Record<string, string> = {
		home: "/dashboard/home",
		patients: "/dashboard/pacientes",
		appointments: "/dashboard/citas",
		surgeryRoom: "/dashboard/sala-de-cirugia",
		inventory: "/dashboard/inventario",
		services: "/dashboard/servicios",
		reports: "/dashboard/reportes",
		ai: "/dashboard/asistente-ia",
		settings: "/dashboard/configuracion",
	}

	// Obtener el item activo basado en la URL actual
	const activeMenuItem = routeToMenuItemId[location.pathname] || "home"

	// Definir todos los items del menú con sus roles permitidos
	const allMenuItems = [
		{
			id: "home",
			label: "Inicio",
			icon: <CiHome className="w-5 h-5" />,
			path: "/dashboard/home",
			allowedRoles: ["Médico", "Paciente", "Admin"], // Todos pueden acceder
		},
		{
			id: "patients",
			label: "Pacientes",
			icon: <CiUser className="w-5 h-5" />,
			path: "/dashboard/pacientes",
			allowedRoles: ["Médico", "Admin"], // Solo médicos y secretaria
		},
		{
			id: "appointments",
			label: "Citas",
			icon: <CiCalendar className="w-5 h-5" />,
			path: "/dashboard/citas",
			allowedRoles: ["Médico", "Paciente", "Admin"], // Todos pueden acceder
		},
		{
			id: "surgeryRoom",
			label: "Sala de Cirugía",
			icon: <GiMedicalDrip className="w-5 h-5" />,
			path: "/dashboard/sala-de-cirugia",
			allowedRoles: ["Médico", "Admin"], // Solo médicos y secretaria
		},
		{
			id: "inventory",
			label: "Inventario",
			icon: <MdOutlineInventory2 className="w-5 h-5" />,
			path: "/dashboard/inventario",
			allowedRoles: ["Médico", "Admin"], // Solo médicos y secretaria
		},
		{
			id: "services",
			label: "Servicios",
			icon: <FaDollarSign className="w-5 h-5" />,
			path: "/dashboard/servicios",
			allowedRoles: ["Médico"], // Solo médicos
		},
		{
			id: "reports",
			label: "Reportes",
			icon: <FaChartBar className="w-5 h-5" />,
			path: "/dashboard/reportes",
			allowedRoles: ["Médico"], // Solo médicos
		},
		{
			id: "ai",
			label: "Asistente Médico",
			icon: <GiArtificialIntelligence className="w-5 h-5" />,
			path: "/dashboard/asistente-ia",
			allowedRoles: ["Médico", "Admin"], // Solo médicos y secretaria
		},
		{
			id: "settings",
			label: "Configuración",
			icon: <CiSettings className="w-5 h-5" />,
			path: "/dashboard/configuracion",
			allowedRoles: ["Médico", "Paciente", "Admin"], // Todos pueden acceder
		},
	]

	// Verificar si el usuario tiene acceso a una ruta específica
	const hasAccessToRoute = useCallback(
		(path: string): boolean => {
			const menuItem = allMenuItems.find((item) => item.path === path)
			if (!menuItem) return false
			const userRole = user?.role || ""
			return menuItem.allowedRoles.includes(userRole)
		},
		[user?.role],
	)

	// Filtrar items del menú basado en el rol del usuario
	const menuItems = allMenuItems.filter((item) => {
		const userRole = user?.role || ""
		return item.allowedRoles.includes(userRole)
	})

	const handleMenuItemClick = (itemId: string) => {
		const route = menuItemIdToRoute[itemId]
		if (route) {
			navigate(route)
		}
	}

	// Redirigir a /dashboard/home si está en /dashboard o si no tiene acceso a la ruta actual
	useEffect(() => {
		if (location.pathname === "/dashboard") {
			navigate("/dashboard/home", { replace: true })
			return
		}

		// Verificar acceso a la ruta actual
		if (!hasAccessToRoute(location.pathname)) {
			// Redirigir a home si no tiene acceso
			navigate("/dashboard/home", { replace: true })
		}
	}, [location.pathname, navigate, hasAccessToRoute])

	const handleToggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	// Renderizar contenido según la ruta actual
	const renderContent = () => {
		const currentPath = location.pathname

		// Determinar qué sección mostrar basado en la ruta
		if (currentPath === "/dashboard" || currentPath === "/dashboard/home") {
			return <DashboardHome />
		}

		if (currentPath === "/dashboard/pacientes") {
			return <MedicalRecords />
		}

		if (currentPath === "/dashboard/citas") {
			return <AppointmentsSection />
		}

		if (currentPath === "/dashboard/sala-de-cirugia") {
			return <SurgeriesSection />
		}

		if (currentPath === "/dashboard/inventario") {
			return <Inventory />
		}

		if (currentPath === "/dashboard/servicios") {
			return <ServicesManagement />
		}

		if (currentPath === "/dashboard/reportes") {
			return <ReportsSection />
		}

		if (currentPath === "/dashboard/asistente-ia") {
			return <GenerateAI />
		}

		if (currentPath === "/dashboard/configuracion") {
			return <Settings userData={userData} refreshUser={refreshUser} />
		}

		// Default: mostrar home si la ruta no coincide
		return <DashboardHome />
	}

	const handleLogout = () => {
		logout()
		window.location.href = "/login"
	}

	return (
		<DashboardSearchProvider>
			<Dashboard
				user={userData}
				menuItems={menuItems}
				isSidebarOpen={isSidebarOpen}
				activeMenuItem={activeMenuItem}
				onMenuItemClick={handleMenuItemClick}
				onToggleSidebar={handleToggleSidebar}
				onLogout={handleLogout}
			>
				{renderContent()}
			</Dashboard>
		</DashboardSearchProvider>
	)
}

export default DashboardPage

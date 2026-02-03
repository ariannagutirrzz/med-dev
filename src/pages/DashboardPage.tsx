import { useCallback, useEffect, useState } from "react"
import { CiCalendar, CiHome, CiSettings, CiUser } from "react-icons/ci"
import { GiMedicalDrip } from "react-icons/gi"
import { MdOutlineInventory2 } from "react-icons/md"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import AppointmentsSection from "../components/Appointments/AppointmentsSection"
import Dashboard from "../components/Dashboard"
import DashboardHeader from "../components/DashboardHeader"
import DashboardHome from "../components/Dashboard/DashboardHome"
import Inventory from "../components/Inventory/Inventory"
import MedicalRecords from "../components/Patients/MedicalRecords"
import Settings from "../components/Settings/Settings"
import SurgeriesSection from "../components/Surgeries/SurgeriesSection"

const DashboardPage: React.FC = () => {
	const { user, logout } = useAuth()
	const navigate = useNavigate()
	const location = useLocation()
	const [isSidebarOpen, setIsSidebarOpen] = useState(true)

	const userData = {
		name: user?.name || "Usuario",
		role: user?.role || "Médico Especialista - Unidad de Pleura",
	}

	// Mapeo de rutas a IDs de menú
	const routeToMenuItemId: Record<string, string> = {
		"/dashboard/home": "home",
		"/dashboard/pacientes": "patients",
		"/dashboard/citas": "appointments",
		"/dashboard/sala-de-cirugia": "surgeryRoom",
		"/dashboard/inventario": "inventory",
		"/dashboard/configuracion": "settings",
	}

	// Mapeo de IDs de menú a rutas
	const menuItemIdToRoute: Record<string, string> = {
		home: "/dashboard/home",
		patients: "/dashboard/pacientes",
		appointments: "/dashboard/citas",
		surgeryRoom: "/dashboard/sala-de-cirugia",
		inventory: "/dashboard/inventario",
		settings: "/dashboard/configuracion",
	}

	// Obtener el item activo basado en la URL actual
	const activeMenuItem =
		routeToMenuItemId[location.pathname] || "home"

	// Definir todos los items del menú con sus roles permitidos
	const allMenuItems = [
		{
			id: "home",
			label: "Inicio",
			icon: <CiHome className="w-5 h-5" />,
			path: "/dashboard/home",
			allowedRoles: ["Médico", "Paciente"], // Ambos pueden acceder
		},
		{
			id: "patients",
			label: "Pacientes",
			icon: <CiUser className="w-5 h-5" />,
			path: "/dashboard/pacientes",
			allowedRoles: ["Médico"], // Solo médicos
		},
		{
			id: "appointments",
			label: "Citas",
			icon: <CiCalendar className="w-5 h-5" />,
			path: "/dashboard/citas",
			allowedRoles: ["Médico", "Paciente"], // Ambos pueden acceder
		},
		{
			id: "surgeryRoom",
			label: "Sala de Cirugía",
			icon: <GiMedicalDrip className="w-5 h-5" />,
			path: "/dashboard/sala-de-cirugia",
			allowedRoles: ["Médico"], // Solo médicos
		},
		{
			id: "inventory",
			label: "Inventario",
			icon: <MdOutlineInventory2 className="w-5 h-5" />,
			path: "/dashboard/inventario",
			allowedRoles: ["Médico"], // Solo médicos
		},
		{
			id: "settings",
			label: "Configuración",
			icon: <CiSettings className="w-5 h-5" />,
			path: "/dashboard/configuracion",
			allowedRoles: ["Médico", "Paciente"], // Ambos pueden acceder
		},
	]

	// Verificar si el usuario tiene acceso a una ruta específica
	const hasAccessToRoute = useCallback((path: string): boolean => {
		const menuItem = allMenuItems.find((item) => item.path === path)
		if (!menuItem) return false
		const userRole = user?.role || ""
		return menuItem.allowedRoles.includes(userRole)
	}, [user?.role])

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
		
		// Verificar acceso a la ruta actual
		if (!hasAccessToRoute(currentPath)) {
			// Redirigir a home si no tiene acceso
			navigate("/dashboard/home", { replace: true })
			return null
		}
		
		// Determinar qué sección mostrar basado en la ruta
		if (currentPath === "/dashboard" || currentPath === "/dashboard/home") {
			return <DashboardHome />
		}
		
		if (currentPath === "/dashboard/pacientes") {
			return (
				<div className="p-6">
					<DashboardHeader />
					<MedicalRecords />
				</div>
			)
		}
		
		if (currentPath === "/dashboard/citas") {
			return <AppointmentsSection />
		}
		
		if (currentPath === "/dashboard/sala-de-cirugia") {
			return <SurgeriesSection />
		}
		
		if (currentPath === "/dashboard/inventario") {
			return (
				<div className="p-6">
					<DashboardHeader />
					<Inventory />
				</div>
			)
		}
		
		if (currentPath === "/dashboard/configuracion") {
			return <Settings userData={userData} />
		}
		
		// Default: redirigir a home si la ruta no coincide
		navigate("/dashboard/home", { replace: true })
		return null
	}

	const handleLogout = () => {
		logout()
		window.location.href = "/login"
	}

	return (
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
	)
}

export default DashboardPage

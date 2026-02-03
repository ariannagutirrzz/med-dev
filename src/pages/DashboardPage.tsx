import { useCallback, useEffect, useState } from "react"
import { CiCalendar, CiHome, CiSettings, CiUser } from "react-icons/ci"
import { FaCalendarCheck, FaClock, FaUserMd } from "react-icons/fa"
import { GiMedicalDrip } from "react-icons/gi"
import { HiOutlineOfficeBuilding, HiOutlineClock } from "react-icons/hi"
import { MdOutlineInventory2, MdAddCircleOutline, MdSearch, MdFilterList } from "react-icons/md"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import AppointmentsSection from "../components/Appointments/AppointmentsSection"
import Calendar, { type Surgery } from "../components/Calendar"
import CalendarLegend from "../components/CalendarLegend"
import Dashboard from "../components/Dashboard"
import DashboardHeader from "../components/DashboardHeader"
import Settings from "../components/Settings/Settings"
import SurgeriesSection from "../components/Surgeries/SurgeriesSection"

// Componentes auxiliares para el contenido
const ContentBlock: React.FC<{ title: string; children: React.ReactNode }> = ({
	title,
	children,
}) => (
	<div className="bg-white rounded-2xl shadow-lg p-6 min-h-60 flex flex-col">
		<h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
		<div className="flex-1 flex items-center justify-center">{children}</div>
	</div>
)

const ContentGrid: React.FC<{
	children: React.ReactNode
	cols?: number
	className?: string
}> = ({ children, cols = 3, className = "" }) => (
	<div
		className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${cols} gap-6 ${className}`}
	>
		{children}
	</div>
)

const DashboardPage: React.FC = () => {
	const { user, logout } = useAuth()
	const [currentDate] = useState(new Date())
	const surgeries: Surgery[] = [
		{ day: 15, type: "Cirugía Mayor" },
		{ day: 18, type: "Cirugía Menor" },
		{ day: 22, type: "Cirugía Programada" },
		{ day: 25, type: "Cirugía Mayor" },
	]
	const currencies = [
		{
			currency: "EUR",
			value: 274.84230343,
		},
		{
			currency: "CNY",
			value: 33.31033851,
		},
		{
			currency: "TRY",
			value: 5.58626986,
		},
		{
			currency: "RUB",
			value: 2.92621114,
		},
		{
			currency: "USD",
			value: 236.4601,
		},
	]
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
				return (
					<div className="p-6">
						<DashboardHeader />

						<ContentGrid cols={3} className="grid-cols-1 lg:grid-cols-4 mt-6">
							<div className="lg:col-span-2 mb-6">
								<h1 className="text-5xl font-bold text-gray-800">
									Bienvenida, {userData.name}! con que te gustaría{" "}
									<b className="text-primary">comenzar</b> hoy?
								</h1>
								<p className="mt-4 text-lg text-gray-400 font-semibold">
									Despliega y familiarizate con cada una de las siguientes
									opciones, te ayudaremos a gestionar de manera más eficiente,
									fácil y rápida.
								</p>
							</div>

							<ContentBlock title="Citas Hoy">
								<div className="text-center">
									<p className="text-3xl font-bold text-green-600">12</p>
									<p className="text-gray-600 mt-2">Citas programadas</p>
								</div>
							</ContentBlock>

							<div className="bg-white rounded-2xl shadow-lg p-6 min-h-60 flex flex-col">
								<div className="flex flex-row justify-between">
									<h3 className="text-lg font-semibold text-gray-800 mb-4">
										Sistema Cambiario
									</h3>
									<img
										src="/src/assets/logo.png"
										alt="Logo del banco central de venezuela"
										className="h-9 w-9"
									/>
								</div>

								<div className="flex-1 flex flex-col">
									{currencies.map((currency) => (
										<div
											className="flex-1 flex flex-row justify-between mx-6 font-semibold text-gray-400"
											key={currency.currency}
										>
											<span>{currency.currency}</span>
											<span>{currency.value}</span>
										</div>
									))}
								</div>
							</div>
						</ContentGrid>

						{/* Contenedor para el grid de 2 columnas */}
						<div className="mt-6">
							<ContentGrid cols={2}>
								<ContentBlock title="Pacientes Activos">
									<div className="text-center">
										<p className="text-3xl font-bold text-blue-600">142</p>
										<p className="text-gray-600 mt-2">
											Pacientes en tratamiento
										</p>
									</div>
								</ContentBlock>
								<div>
									<div className="bg-white rounded-2xl shadow-lg p-6 min-h-60 flex flex-col">
										<div className="flex-1 flex items-center justify-center">
											<Calendar surgeries={surgeries} showLegend={false} />
										</div>
									</div>
								</div>
							</ContentGrid>
						</div>
						<div className="mt-6">
							<ContentGrid cols={2}>
								<div></div>
								<div className="mt-4 flex justify-center">
									<CalendarLegend
										surgeries={surgeries}
										currentMonth={currentDate.getMonth()}
									/>
								</div>
							</ContentGrid>
						</div>
					</div>
				)
		}
		
		if (currentPath === "/dashboard/pacientes") {
			return (
					<div className="p-6">
						<DashboardHeader />
						<div className="bg-white rounded-2xl shadow-lg p-6 min-h-60 flex flex-col">
							<h3 className="text-lg font-semibold text-gray-800 mb-4">
								Historias Medicas
							</h3>
							<div className="flex-1"></div>
						</div>
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
						<div className="mb-6 flex justify-between items-center">
							<div>
								<h1 className="text-3xl font-bold text-gray-800">
									Inventario
								</h1>
								<p className="text-gray-600 mt-2">Gestiona el inventario de suministros médicos</p>
							</div>
							<button type="button" className="bg-primary text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-primary-dark transition-colors">
								<MdAddCircleOutline className="w-5 h-5" />
								<span>Agregar Item</span>
							</button>
						</div>

						{/* Estadísticas */}
						<ContentGrid cols={4} className="mb-6">
							<ContentBlock title="Total Items">
								<div className="text-center">
									<p className="text-3xl font-bold text-blue-600">1,247</p>
									<p className="text-gray-600 mt-2 text-sm">Artículos</p>
								</div>
							</ContentBlock>
							<ContentBlock title="Bajo Stock">
								<div className="text-center">
									<p className="text-3xl font-bold text-red-600">23</p>
									<p className="text-gray-600 mt-2 text-sm">Necesitan reposición</p>
								</div>
							</ContentBlock>
							<ContentBlock title="Categorías">
								<div className="text-center">
									<p className="text-3xl font-bold text-green-600">12</p>
									<p className="text-gray-600 mt-2 text-sm">Categorías activas</p>
								</div>
							</ContentBlock>
							<ContentBlock title="Valor Total">
								<div className="text-center">
									<p className="text-3xl font-bold text-purple-600">$45.2K</p>
									<p className="text-gray-600 mt-2 text-sm">Inventario</p>
								</div>
							</ContentBlock>
						</ContentGrid>

						{/* Filtros y búsqueda */}
						<div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
							<div className="flex flex-wrap gap-4">
								<div className="flex-1 min-w-[200px]">
									<div className="relative">
										<MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
										<input
											type="text"
											placeholder="Buscar por nombre, código o categoría..."
											className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
										/>
									</div>
								</div>
								<select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
									<option>Todas las categorías</option>
									<option>Medicamentos</option>
									<option>Equipos</option>
									<option>Suministros</option>
									<option>Instrumentos</option>
								</select>
								<select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
									<option>Todo el stock</option>
									<option>Bajo stock</option>
									<option>Stock normal</option>
									<option>Sin stock</option>
								</select>
							</div>
						</div>

						{/* Tabla de inventario */}
						<div className="bg-white rounded-2xl shadow-lg p-6">
							<h3 className="text-lg font-semibold text-gray-800 mb-4">Lista de Inventario</h3>
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="border-b border-gray-200">
											<th className="text-left py-3 px-4 font-semibold text-gray-700">Código</th>
											<th className="text-left py-3 px-4 font-semibold text-gray-700">Nombre</th>
											<th className="text-left py-3 px-4 font-semibold text-gray-700">Categoría</th>
											<th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
											<th className="text-left py-3 px-4 font-semibold text-gray-700">Unidad</th>
											<th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
											<th className="text-left py-3 px-4 font-semibold text-gray-700">Acciones</th>
										</tr>
									</thead>
									<tbody>
										<tr className="border-b border-gray-100 hover:bg-gray-50">
											<td className="py-3 px-4 text-gray-700">MED-001</td>
											<td className="py-3 px-4 text-gray-700 font-medium">Paracetamol 500mg</td>
											<td className="py-3 px-4 text-gray-600">Medicamentos</td>
											<td className="py-3 px-4">
												<span className="font-semibold text-gray-800">1,245</span>
											</td>
											<td className="py-3 px-4 text-gray-600">Unidades</td>
											<td className="py-3 px-4">
												<span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
													Disponible
												</span>
											</td>
											<td className="py-3 px-4">
												<button type="button" className="text-primary hover:text-primary-dark text-sm font-medium">
													Editar
												</button>
											</td>
										</tr>
										<tr className="border-b border-gray-100 hover:bg-gray-50">
											<td className="py-3 px-4 text-gray-700">EQU-042</td>
											<td className="py-3 px-4 text-gray-700 font-medium">Monitor de Signos Vitales</td>
											<td className="py-3 px-4 text-gray-600">Equipos</td>
											<td className="py-3 px-4">
												<span className="font-semibold text-gray-800">8</span>
											</td>
											<td className="py-3 px-4 text-gray-600">Unidades</td>
											<td className="py-3 px-4">
												<span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
													Bajo Stock
												</span>
											</td>
											<td className="py-3 px-4">
												<button type="button" className="text-primary hover:text-primary-dark text-sm font-medium">
													Editar
												</button>
											</td>
										</tr>
										<tr className="border-b border-gray-100 hover:bg-gray-50">
											<td className="py-3 px-4 text-gray-700">SUM-156</td>
											<td className="py-3 px-4 text-gray-700 font-medium">Guantes Quirúrgicos</td>
											<td className="py-3 px-4 text-gray-600">Suministros</td>
											<td className="py-3 px-4">
												<span className="font-semibold text-gray-800">3,420</span>
											</td>
											<td className="py-3 px-4 text-gray-600">Pares</td>
											<td className="py-3 px-4">
												<span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
													Disponible
												</span>
											</td>
											<td className="py-3 px-4">
												<button type="button" className="text-primary hover:text-primary-dark text-sm font-medium">
													Editar
												</button>
											</td>
										</tr>
										<tr className="border-b border-gray-100 hover:bg-gray-50">
											<td className="py-3 px-4 text-gray-700">INS-089</td>
											<td className="py-3 px-4 text-gray-700 font-medium">Bisturí #11</td>
											<td className="py-3 px-4 text-gray-600">Instrumentos</td>
											<td className="py-3 px-4">
												<span className="font-semibold text-red-600">0</span>
											</td>
											<td className="py-3 px-4 text-gray-600">Unidades</td>
											<td className="py-3 px-4">
												<span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
													Sin Stock
												</span>
											</td>
											<td className="py-3 px-4">
												<button type="button" className="text-primary hover:text-primary-dark text-sm font-medium">
													Editar
												</button>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
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

import { useState } from "react"
import { CiCalendar, CiHome, CiSettings, CiUser } from "react-icons/ci"
import { FaCalendarCheck, FaClock, FaUserMd } from "react-icons/fa"
import { GiMedicalDrip } from "react-icons/gi"
import { HiOutlineOfficeBuilding, HiOutlineClock } from "react-icons/hi"
import { MdOutlineInventory2, MdAddCircleOutline, MdSearch, MdFilterList } from "react-icons/md"
import { useAuth } from "../contexts/AuthContext"
import AppointmentsSection from "../components/Appointments/AppointmentsSection"
import Calendar, { type Surgery } from "../components/Calendar"
import CalendarLegend from "../components/CalendarLegend"
import Dashboard from "../components/Dashboard"
import DashboardHeader from "../components/DashboardHeader"
import Settings from "../components/Settings/Settings"

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
	const [activeMenuItem, setActiveMenuItem] = useState("home")
	const [isSidebarOpen, setIsSidebarOpen] = useState(true)

	const userData = {
		name: user?.name || "Usuario",
		role: user?.role || "Médico Especialista - Unidad de Pleura",
	}

	const menuItems = [
		{
			id: "home",
			label: "Inicio",
			icon: <CiHome className="w-5 h-5" />,
		},
		{
			id: "patients",
			label: "Pacientes",
			icon: <CiUser className="w-5 h-5" />,
		},
		{
			id: "appointments",
			label: "Citas",
			icon: <CiCalendar className="w-5 h-5" />,
		},
		{
			id: "surgeryRoom",
			label: "Sala de Cirugía",
			icon: <GiMedicalDrip className="w-5 h-5" />,
		},
		{
			id: "inventory",
			label: "Inventario",
			icon: <MdOutlineInventory2 className="w-5 h-5" />,
		},
		{
			id: "settings",
			label: "Configuración",
			icon: <CiSettings className="w-5 h-5" />,
		},
	]

	const handleMenuItemClick = (itemId: string) => {
		setActiveMenuItem(itemId)
	}

	const handleToggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	// Renderizar contenido según el ítem activo
	const renderContent = () => {
		switch (activeMenuItem) {
			case "home":
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

			case "patients":
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

			case "appointments":
				return <AppointmentsSection />

			case "surgeryRoom":
				return (
					<div className="p-6">
						<div className="mb-6 flex justify-between items-center">
							<div>
								<h1 className="text-3xl font-bold text-gray-800">
									Reserva de Sala de Cirugía
								</h1>
								<p className="text-gray-600 mt-2">Gestiona las reservas de las salas quirúrgicas</p>
							</div>
							<button type="button" className="bg-primary text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-primary-dark transition-colors">
								<MdAddCircleOutline className="w-5 h-5" />
								<span>Nueva Reserva</span>
							</button>
						</div>

						{/* Estadísticas rápidas */}
						<ContentGrid cols={4} className="mb-6">
							<ContentBlock title="Salas Disponibles">
								<div className="text-center">
									<p className="text-3xl font-bold text-green-600">3</p>
									<p className="text-gray-600 mt-2 text-sm">Disponibles hoy</p>
								</div>
							</ContentBlock>
							<ContentBlock title="Reservas Hoy">
								<div className="text-center">
									<p className="text-3xl font-bold text-blue-600">5</p>
									<p className="text-gray-600 mt-2 text-sm">Programadas</p>
								</div>
							</ContentBlock>
							<ContentBlock title="En Uso">
								<div className="text-center">
									<p className="text-3xl font-bold text-orange-600">2</p>
									<p className="text-gray-600 mt-2 text-sm">Actualmente</p>
								</div>
							</ContentBlock>
							<ContentBlock title="Total Salas">
								<div className="text-center">
									<p className="text-3xl font-bold text-purple-600">5</p>
									<p className="text-gray-600 mt-2 text-sm">Salas activas</p>
								</div>
							</ContentBlock>
						</ContentGrid>

						{/* Calendario de reservas */}
						<div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-lg font-semibold text-gray-800">Calendario de Reservas</h3>
								<div className="flex gap-2">
									<button type="button" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
										Hoy
									</button>
									<button type="button" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
										Semana
									</button>
									<button type="button" className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
										Mes
									</button>
								</div>
							</div>
							<div className="grid grid-cols-7 gap-2">
								{["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
									<div key={day} className="text-center font-semibold text-gray-600 py-2">
										{day}
									</div>
								))}
								{Array.from({ length: 28 }).map((_, i) => (
									<div
										key={`calendar-day-${i}`}
										className={`border border-gray-200 rounded-lg p-2 min-h-[80px] ${
											i === 14 ? "bg-primary/10 border-primary" : ""
										}`}
									>
										<div className="text-sm font-medium text-gray-700">{i + 1}</div>
										{i === 14 && (
											<div className="mt-1 text-xs bg-primary text-white rounded px-1 py-0.5">
												Cirugía Mayor
											</div>
										)}
									</div>
								))}
							</div>
						</div>

						{/* Lista de reservas */}
						<div className="bg-white rounded-2xl shadow-lg p-6">
							<h3 className="text-lg font-semibold text-gray-800 mb-4">Reservas Activas</h3>
							<div className="space-y-4">
								{/* Reserva ejemplo 1 */}
								<div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
									<div className="flex justify-between items-start">
										<div className="flex gap-4">
											<div className="bg-red-100 p-3 rounded-lg">
												<HiOutlineOfficeBuilding className="w-6 h-6 text-red-600" />
											</div>
											<div>
												<h4 className="font-semibold text-gray-800">Sala de Cirugía 1</h4>
												<p className="text-gray-600 text-sm">Cirugía Mayor - Toracoscopia</p>
												<div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
													<span className="flex items-center gap-1">
														<HiOutlineClock className="w-4 h-4" />
														08:00 - 12:00
													</span>
													<span>Dr. María González</span>
												</div>
											</div>
										</div>
										<span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
											En Uso
										</span>
									</div>
								</div>

								{/* Reserva ejemplo 2 */}
								<div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
									<div className="flex justify-between items-start">
										<div className="flex gap-4">
											<div className="bg-blue-100 p-3 rounded-lg">
												<HiOutlineOfficeBuilding className="w-6 h-6 text-blue-600" />
											</div>
											<div>
												<h4 className="font-semibold text-gray-800">Sala de Cirugía 2</h4>
												<p className="text-gray-600 text-sm">Cirugía Menor - Biopsia</p>
												<div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
													<span className="flex items-center gap-1">
														<HiOutlineClock className="w-4 h-4" />
														14:00 - 15:30
													</span>
													<span>Dr. Carlos Rodríguez</span>
												</div>
											</div>
										</div>
										<span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
											Reservada
										</span>
									</div>
								</div>

								{/* Reserva ejemplo 3 */}
								<div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
									<div className="flex justify-between items-start">
										<div className="flex gap-4">
											<div className="bg-green-100 p-3 rounded-lg">
												<HiOutlineOfficeBuilding className="w-6 h-6 text-green-600" />
											</div>
											<div>
												<h4 className="font-semibold text-gray-800">Sala de Cirugía 3</h4>
												<p className="text-gray-600 text-sm">Disponible</p>
												<div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
													<span>Sin reservas programadas</span>
												</div>
											</div>
										</div>
										<span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
											Disponible
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				)

			case "inventory":
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

			case "settings":
				return <Settings userData={userData} />

			default:
				return (
					<div className="p-6">
						<div className="mb-6">
							<h1 className="text-3xl font-bold text-gray-800">
								Bienvenido, {userData.name}!
							</h1>
							<p className="text-gray-600 mt-2">
								con que te gustaría <b className="text-green-600">comenzar</b>{" "}
								hoy?
							</p>
						</div>

						<ContentGrid cols={3}>
							<ContentBlock title="Pacientes Activos">
								<div className="text-center">
									<p className="text-3xl font-bold text-blue-600">142</p>
									<p className="text-gray-600 mt-2">Pacientes en tratamiento</p>
								</div>
							</ContentBlock>

							<ContentBlock title="Citas Hoy">
								<div className="text-center">
									<p className="text-3xl font-bold text-green-600">12</p>
									<p className="text-gray-600 mt-2">Citas programadas</p>
								</div>
							</ContentBlock>

							<ContentBlock title="Sistema Cambiario">
								<div className="text-center">
									<p className="text-3xl font-bold text-purple-600">94%</p>
									<p className="text-gray-600 mt-2">Tasa de éxito</p>
								</div>
							</ContentBlock>
						</ContentGrid>
					</div>
				)
		}
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

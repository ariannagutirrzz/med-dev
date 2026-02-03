import { useState } from "react"
import { CiCalendar, CiHome, CiSettings, CiUser } from "react-icons/ci"
import { FaPlus } from "react-icons/fa"
import { GiMedicalDrip } from "react-icons/gi"
import { MdOutlineInventory2 } from "react-icons/md"
import Calendar, { type Surgery } from "../components/Calendar"
import CalendarLegend from "../components/CalendarLegend"
import Dashboard from "../components/Dashboard"
import DashboardHeader from "../components/DashboardHeader"
import CreateSupplyModal from "../components/Inventory/CreateSupplyModal"
import Inventory from "../components/Inventory/Inventory"
import MedicalRecords from "../components/Patients/MedicalRecords"
import { useAuth } from "../contexts/AuthContext"

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

	const [isModalOpen, setIsModalOpen] = useState(false)

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
							<div className="flex-1">
								<MedicalRecords />
							</div>
						</div>
					</div>
				)

			case "appointments":
				return (
					<div className="p-6">
						<div className="mb-6">
							<h1 className="text-3xl font-bold text-gray-800">
								Gestión de Citas
							</h1>
							<p className="text-gray-600 mt-2">Programa y administra citas</p>
						</div>
						<ContentBlock title="Calendario de Citas">
							<p>Contenido de citas...</p>
						</ContentBlock>
					</div>
				)
			case "inventory":
				return (
					<div className="p-6">
						<div className="flex mb-6 justify-between">
							<div>
								<h1 className="text-3xl font-bold text-gray-800">Inventario</h1>
								<p className="text-gray-600 mt-2">
									Gestiona el inventario de suministros médicos
								</p>
							</div>

							<div>
								<button
									type="button"
									onClick={() => setIsModalOpen(true)} // <-- Activa el modal
									className="flex items-center justify-center gap-2 cursor-pointer bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
								>
									<FaPlus size={14} />
									Nuevo Insumo
								</button>
							</div>
						</div>

						<Inventory />

						{/* Inyectamos el Modal aquí */}
						<CreateSupplyModal
							isOpen={isModalOpen}
							onClose={() => setIsModalOpen(false)}
						/>
					</div>
				)

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

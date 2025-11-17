import {
	CalendarIcon,
	CogIcon,
	HomeIcon,
	InboxStackIcon,
	ScissorsIcon,
	UsersIcon,
} from "@heroicons/react/24/outline"
import { useState } from "react"
import Dashboard from "./Dashboard"
import DashboardHeader from "./DashboardHeader"

// Componentes auxiliares para el contenido
const ContentBlock: React.FC<{ title: string; children: React.ReactNode }> = ({
	title,
	children,
}) => (
	<div className="bg-white rounded-2xl shadow-lg p-6">
		<h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
		{children}
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
	const [activeMenuItem, setActiveMenuItem] = useState("home")
	const [isSidebarOpen, setIsSidebarOpen] = useState(true)
	// Estado para la búsqueda

	const userData = {
		name: "Dra. Ninive Azuaje",
		role: "Médico Especialista - Unidad de Pleura",
	}

	const menuItems = [
		{
			id: "home",
			label: "Inicio",
			icon: <HomeIcon className="w-5 h-5" />,
		},
		{
			id: "patients",
			label: "Pacientes",
			icon: <UsersIcon className="w-5 h-5" />,
		},
		{
			id: "appointments",
			label: "Citas",
			icon: <CalendarIcon className="w-5 h-5" />,
		},
		{
			id: "surgeryRoom",
			label: "Sala de Cirugía",
			icon: <ScissorsIcon className="w-5 h-5" />,
		},
		{
			id: "inventory",
			label: "Inventario",
			icon: <InboxStackIcon className="w-5 h-5" />,
		},
		{
			id: "settings",
			label: "Configuración",
			icon: <CogIcon className="w-5 h-5" />,
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
								<h1 className="text-4xl font-bold text-gray-800">
									Bienvenida, {userData.name}! <br /> con que te gustaría{" "}
									<b className="text-primary">comenzar</b> hoy?
								</h1>
								<p className="mt-2 text-gray-400 font-semibold">
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

							<ContentBlock title="Eficiencia">
								<div className="text-center">
									<p className="text-3xl font-bold text-purple-600">94%</p>
									<p className="text-gray-600 mt-2">Tasa de éxito</p>
								</div>
							</ContentBlock>
						</ContentGrid>

						<ContentGrid cols={2} className="mt-6">
							<ContentBlock title="Pacientes Activos">
								<div className="text-center">
									<p className="text-3xl font-bold text-blue-600">142</p>
									<p className="text-gray-600 mt-2">Pacientes en tratamiento</p>
								</div>
							</ContentBlock>
						</ContentGrid>
					</div>
				)

			case "patients":
				return (
					<div className="p-6">
						<div className="mb-6">
							<h1 className="text-3xl font-bold text-gray-800">
								Gestión de Pacientes
							</h1>
							<p className="text-gray-600 mt-2">
								Administra la información de los pacientes
							</p>
						</div>
						<ContentBlock title="Lista de Pacientes">
							<p>Contenido de pacientes...</p>
						</ContentBlock>
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

							<ContentBlock title="Eficiencia">
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

	return (
		<Dashboard
			user={userData}
			menuItems={menuItems}
			isSidebarOpen={isSidebarOpen}
			activeMenuItem={activeMenuItem}
			onMenuItemClick={handleMenuItemClick}
			onToggleSidebar={handleToggleSidebar}
		>
			{renderContent()}
		</Dashboard>
	)
}

export default DashboardPage

import { useState } from "react"
import { CiCalendar, CiMail, CiPhone, CiSquarePlus } from "react-icons/ci"
import { LuArrowLeft, LuPencilLine, LuPlus } from "react-icons/lu"
import type { Patient } from "../../types"
import { calcularEdad } from "../utils"
import ClinicalEvolution from "./ClinicalEvolution"

export default function MedicalRecords() {
	// 1. ESTADOS PARA NAVEGACIÓN
	const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
	const [view, setView] = useState<"list" | "details">("list")

	const records: Patient[] = [
		{
			id: 1,
			first_name: "Juan",
			last_name: "Perez",
			email: "correo@ejemplo.com",
			phone: "0412-1234567",
			birthdate: new Date("1998-01-31"),
			gender: "M",
			address: "Calle Principal, Caracas",
			document_id: "V-12345678",
		},
		{
			id: 2,
			first_name: "Maria",
			last_name: "Perez",
			email: "correo@ejemplo.com",
			phone: "0412-1234567",
			birthdate: new Date("1998-01-31"),
			gender: "F",
			address: "Calle Principal, Caracas",
			document_id: "V-12345678",
		},
	]

	// 2. FUNCIONES DE NAVEGACIÓN
	const handlePatientClick = (patient: Patient) => {
		setSelectedPatient(patient)
		setView("details")
	}

	const handleBack = () => {
		setSelectedPatient(null)
		setView("list")
	}

	// 3. RENDERIZADO CONDICIONAL: VISTA DETALLE
	if (view === "details" && selectedPatient) {
		return (
			<div>
				<div className="flex justify-between items-center">
					<div className="flex">
						<h3 className="text-xl font-bold text-gray-800 mb-4">
							Historial Clínico
						</h3>
						<button
							type="button"
							onClick={handleBack}
							className="mb-2 mx-2 cursor-pointer flex items-center gap-2 text-primary font-bold hover:bg-primary/10 rounded-xl transition-colors"
						>
							<LuArrowLeft className="w-5 h-5" />
							Volver al listado
						</button>
					</div>
					<button
						type="button"
						className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl hover:scale-105 transition-all shadow-lg shadow-primary/30 font-bold text-sm"
					>
						<LuPlus className="w-5 h-5" />
						REGISTRAR EVOLUCIÓN
					</button>
				</div>

				<ClinicalEvolution
					patientName={`${selectedPatient.first_name} ${selectedPatient.last_name}`}
					patientId={selectedPatient.document_id}
				/>
			</div>
		)
	}

	// 4. RENDERIZADO: VISTA LISTADO (GRID)
	return (
		<>
			<h3 className="text-xl font-bold text-gray-800 mb-4">
				Historias Médicas
			</h3>
			<div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 auto-rows-fr p-4">
				{/* Card de Acción: Nuevo Registro */}
				<div className="relative w-full h-full min-h-80">
					<div className="group absolute bg-white rounded-2xl shadow-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-4 hover:border-primary transition-all duration-300 cursor-pointer w-56 h-72 hover:w-full hover:h-full mx-auto my-auto left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 ">
						<CiSquarePlus className="text-primary w-12 h-12 transition-transform duration-300 group-hover:scale-110" />
						<span className="text-gray-400 mt-2 font-medium group-hover:text-primary">
							Nuevo Registro
						</span>
					</div>
				</div>

				{/* Listado de Pacientes */}
				{records.map((record) => (
					<button
						type="button"
						key={record.id}
						onClick={() => handlePatientClick(record)}
						className="group w-full h-full min-h-80 bg-gray-100 rounded-2xl shadow-md border-2 border-gray-300 p-5 hover:shadow-xl hover:border-primary hover:bg-white transition-all duration-300 flex flex-col text-left items-stretch focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
					>
						{/* Header: Nombre y Género */}
						<div className="flex justify-between items-start mb-4">
							<h4 className="text-lg font-bold text-gray-800 leading-tight">
								{record.first_name} {record.last_name}
							</h4>
							<span
								className={`px-2 py-1 rounded-md text-[10px] font-black shrink-0 ${record.gender === "M" ? "bg-blue-100 text-blue-600" : "bg-pink-100 text-pink-600"}`}
							>
								{record.gender}
							</span>
						</div>

						{/* Cuerpo: Información */}
						<div className="flex-1 space-y-2 pointer-events-none">
							<div>
								<p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
									Identificación
								</p>
								<p className="text-gray-600 text-sm font-semibold">
									{record.document_id}
								</p>
							</div>

							<div className="grid grid-cols-2 gap-2">
								<div>
									<p className="text-[10px] text-gray-400 uppercase font-black">
										Edad
									</p>
									<p className="text-gray-600 text-sm font-semibold">
										{calcularEdad(record.birthdate)} años
									</p>
								</div>
							</div>

							<div className="pt-2 border-t border-gray-200 space-y-1.5">
								<p className="text-gray-500 text-sm flex items-center italic truncate">
									<CiMail className="mr-2 text-primary w-4 h-4 shrink-0" />
									{record.email}
								</p>
								<p className="text-gray-500 text-sm flex items-center">
									<CiPhone className="mr-2 text-primary w-4 h-4 shrink-0" />
									{record.phone}
								</p>
							</div>
						</div>

						{/* Footer */}
						<div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center pointer-events-none">
							<div className="flex flex-col">
								<p className="text-[9px] text-gray-400 uppercase font-black">
									Nacimiento
								</p>
								<p className="text-xs text-gray-500 flex items-center font-medium">
									<CiCalendar className="mr-1 text-primary w-4 h-4" />
									{record.birthdate.toLocaleDateString("es-ES")}
								</p>
							</div>
							<LuPencilLine className="h-6 w-6 text-gray-400 group-hover:text-primary transition-all duration-300" />
						</div>
					</button>
				))}
			</div>
		</>
	)
}

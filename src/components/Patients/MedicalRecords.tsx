import { useState } from "react"
import { CiCalendar, CiMail, CiPhone, CiSquarePlus } from "react-icons/ci"
import { LuArrowLeft, LuPencilLine, LuPlus } from "react-icons/lu"
import type { Patient } from "../../types"
import { calcularEdad } from "../utils"
import ClinicalEvolution from "./ClinicalEvolution"
import PatientModalForm from "./PatientModalForm"

export default function MedicalRecords() {
	// 1. ESTADOS
	const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
	const [view, setView] = useState<"list" | "details">("list")
	const [newEvolution, setNewEvolution] = useState<boolean>(false)
	const [isPatientModalOpen, setIsPatientModalOpen] = useState(false)
	const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null)

	const [records, setRecords] = useState<Patient[]>([
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
			email: "maria@ejemplo.com",
			phone: "0412-7654321",
			birthdate: new Date("1995-05-15"),
			gender: "F",
			address: "Av. Bolivar, Valencia",
			document_id: "V-87654321",
		},
		{
			id: 3,
			first_name: "Maria",
			last_name: "Perez",
			email: "maria@ejemplo.com",
			phone: "0412-7654321",
			birthdate: new Date("1995-05-15"),
			gender: "F",
			address: "Av. Bolivar, Valencia",
			document_id: "V-87654321",
		},
		{
			id: 3,
			first_name: "Maria",
			last_name: "Perez",
			email: "maria@ejemplo.com",
			phone: "0412-7654321",
			birthdate: new Date("1995-05-15"),
			gender: "F",
			address: "Av. Bolivar, Valencia",
			document_id: "V-87654321",
		},
	])

	// 2. HANDLERS
	const handleBack = () => {
		setSelectedPatient(null)
		setView("list")
	}

	const handleCreatePatient = () => {
		setPatientToEdit(null)
		setIsPatientModalOpen(true)
	}

	const handleEditPatient = (e: React.MouseEvent, patient: Patient) => {
		e.stopPropagation()
		setPatientToEdit(patient)
		setIsPatientModalOpen(true)
	}

	const handleSavePatient = (patientData: Patient) => {
		if (patientToEdit) {
			setRecords(
				records.map((r) => (r.id === patientData.id ? patientData : r)),
			)
		} else {
			setRecords([...records, { ...patientData, id: Date.now() }])
		}
		setIsPatientModalOpen(false)
	}

	// 3. VISTA DETALLE
	if (view === "details" && selectedPatient) {
		return (
			<div className="animate-in fade-in duration-300">
				<div className="flex justify-between items-center mb-6">
					<div className="flex items-center gap-4">
						<h3 className="text-xl font-bold text-gray-800">
							Historial:{" "}
							<span className="text-primary">
								{selectedPatient.first_name} {selectedPatient.last_name}
							</span>
						</h3>
						<button
							type="button"
							onClick={handleBack}
							className="cursor-pointer flex items-center gap-2 text-primary font-bold hover:bg-primary/10 px-4 py-2 rounded-xl transition-all"
						>
							<LuArrowLeft className="w-5 h-5" />
							Volver
						</button>
					</div>
					<button
						type="button"
						onClick={() => setNewEvolution(true)}
						className="flex items-center gap-2 cursor-pointer bg-primary text-white px-6 py-3 rounded-2xl hover:scale-105 transition-all shadow-lg font-bold text-sm"
					>
						<LuPlus className="w-5 h-5" />
						REGISTRAR EVOLUCIÓN
					</button>
				</div>

				<ClinicalEvolution
					patientName={`${selectedPatient.first_name} ${selectedPatient.last_name}`}
					patientId={selectedPatient.document_id}
					newEvolution={newEvolution}
					setNewEvolution={setNewEvolution}
				/>
			</div>
		)
	}

	// 4. VISTA LISTADO
	return (
		<>
			<h3 className="text-xl font-bold text-gray-800 mb-6 px-2">
				Historias Médicas
			</h3>

			{/* Ajuste de Grid: Se redujo el número de columnas máximas para que cada card sea más ancha */}
			<div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 p-2">
				{/* Botón: Nuevo Registro */}
				<button
					type="button"
					onClick={handleCreatePatient}
					className="group relative w-full h-80 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-4 hover:border-primary hover:bg-primary/5 transition-all duration-300 cursor-pointer shadow-sm"
				>
					<CiSquarePlus className="text-primary w-14 h-14 transition-transform duration-300 group-hover:scale-110" />
					<span className="text-gray-400 mt-2 font-black uppercase text-xs tracking-widest group-hover:text-primary">
						Nuevo Registro
					</span>
				</button>

				{/* Grid de Pacientes */}
				{records.map((record) => (
					<div key={record.id} className="relative group">
						<button
							type="button"
							onClick={() => {
								setSelectedPatient(record)
								setView("details")
							}}
							className="w-full h-80 bg-gray-50 rounded-[2.5rem] shadow-sm border border-gray-200 p-8 hover:shadow-xl hover:border-primary hover:bg-white transition-all duration-300 flex flex-col text-left cursor-pointer overflow-hidden"
						>
							<div className="flex justify-between items-start mb-6 w-full">
								<h4 className="text-xl font-black text-gray-800 leading-tight group-hover:text-primary transition-colors">
									{record.first_name} <br /> {record.last_name}
								</h4>
								<span
									className={`px-4 py-1.5 rounded-full text-[11px] font-black shrink-0 shadow-sm ${
										record.gender === "M"
											? "bg-blue-100 text-blue-600"
											: "bg-pink-100 text-pink-600"
									}`}
								>
									{record.gender}
								</span>
							</div>

							<div className="flex-1 space-y-4 w-full">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
											Identificación
										</p>
										<p className="text-gray-700 text-sm font-bold">
											{record.document_id}
										</p>
									</div>
									<div>
										<p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
											Edad
										</p>
										<p className="text-gray-700 text-sm font-bold">
											{calcularEdad(record.birthdate)} años
										</p>
									</div>
								</div>

								<div className="pt-4 border-t border-gray-100 space-y-2.5">
									<p className="text-gray-500 text-[13px] flex items-center italic truncate">
										<CiMail className="mr-3 text-primary w-5 h-5" />
										{record.email}
									</p>
									<p className="text-gray-500 text-[13px] flex items-center font-medium">
										<CiPhone className="mr-3 text-primary w-5 h-5" />
										{record.phone}
									</p>
								</div>
							</div>

							<div className="mt-4 pt-4 border-t border-gray-100 flex flex-col w-full">
								<p className="text-[9px] text-gray-400 uppercase font-black mb-1">
									Fecha de Nacimiento
								</p>
								<p className="text-xs text-gray-600 flex items-center font-bold">
									<CiCalendar className="mr-2 text-primary w-5 h-5" />
									{record.birthdate.toLocaleDateString("es-ES", {
										day: "2-digit",
										month: "long",
										year: "numeric",
									})}
								</p>
							</div>
						</button>

						{/* Botón de Edición (Independiente) */}
						<button
							type="button"
							onClick={(e) => handleEditPatient(e, record)}
							className="absolute bottom-7 right-4 p-2 bg-white border border-gray-100 text-gray-400 hover:text-primary hover:border-primary hover:shadow-lg hover:scale-110 rounded-2xl transition-all cursor-pointer z-10 shadow-md"
							title="Editar información del paciente"
						>
							<LuPencilLine className="h-6 w-6" />
						</button>
					</div>
				))}
			</div>

			<PatientModalForm
				isOpen={isPatientModalOpen}
				onClose={() => setIsPatientModalOpen(false)}
				patient={patientToEdit}
				onSave={handleSavePatient}
			/>
		</>
	)
}

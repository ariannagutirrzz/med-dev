import { useCallback, useEffect, useState } from "react"
import { CiCalendar, CiMail, CiPhone, CiSquarePlus } from "react-icons/ci"
import { LuArrowLeft, LuPencilLine, LuPlus } from "react-icons/lu"
// 1. Importamos el service
import { getDoctorPatients, getPatients } from "../services/PatientsAPI"
import type { Patient } from "../../../shared"
import { Button, calcularEdad, formatPhoneDisplay } from "../../../shared"
import ClinicalEvolution from "./ClinicalEvolution"
import PatientModalForm from "./PatientModalForm"
import PatientSearchBar from "./PatientSearchBar"
import { useAuth } from "../../auth"

export default function MedicalRecords() {
	// 2. ESTADOS (Iniciamos records vacío)
	const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
	const [view, setView] = useState<"list" | "details">("list")
	const [newEvolution, setNewEvolution] = useState<boolean>(false)
	const [isPatientModalOpen, setIsPatientModalOpen] = useState(false)
	const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null)
	const [records, setRecords] = useState<Patient[]>([])
	const [searchTerm, setSearchTerm] = useState("")
	const { user } = useAuth()

	// 3. FUNCIÓN DE CARGA (Memoizada para evitar errores de linter y re-renders)
	const loadPatients = useCallback(async () => {
		try {
			let data;
			if (user?.role === "Admin") {
				data = await getPatients()
			} else {
				data = await getDoctorPatients()
			}
			// Transformamos birthdate de string a Date para que calcularEdad no falle
			const formattedData = data.patients.map((p: Patient) => ({
				...p,
				birthdate: new Date(p.birthdate),
			}))
			setRecords(formattedData)
		} catch (error) {
			console.error("Error al cargar pacientes:", error)
		}
	}, [user])

	// 4. EFECTO DE CARGA INICIAL
	useEffect(() => {
		loadPatients()
	}, [loadPatients])

	// 5. HANDLERS
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

	// Modificamos este handler para que refresque desde la API
	const handleSavePatient = () => {
		loadPatients() // Recarga los datos frescos del servidor
		setIsPatientModalOpen(false)
	}

	// Filtrado de la barra de busqueda

	const filteredRecords = records.filter((record) => {
		const search = searchTerm.toLowerCase()
		const fullName = `${record.first_name} ${record.last_name}`.toLowerCase()
		const fullNameReverse =
			`${record.last_name} ${record.first_name}`.toLowerCase()
		return (
			fullName.includes(search) ||
			fullNameReverse.includes(search) ||
			record.document_id.toString().includes(search)
		)
	})

	// 6. VISTA DETALLE
	if (view === "details" && selectedPatient) {
		return (
			<div className="p-6">
				<div className="animate-in fade-in duration-300">
					<div className="flex justify-between items-center mb-6">
						<div className="flex items-center gap-4">
							<h3 className="text-xl font-bold text-gray-800">
								Historial:{" "}
								<span className="text-primary">
									{selectedPatient.first_name} {selectedPatient.last_name}
								</span>
							</h3>
							<Button
								type="button"
								variant="default"
								onClick={handleBack}
								icon={<LuArrowLeft className="w-5 h-5" />}
								className="!font-bold !px-4 !py-2 !rounded-xl border-primary text-primary hover:!bg-primary/10"
							>
								Volver
							</Button>
						</div>
						<Button
							type="button"
							onClick={() => setNewEvolution(true)}
							icon={<LuPlus className="w-5 h-5" />}
							className="!px-6 !py-3 !rounded-2xl !font-bold !text-sm"
						>
							REGISTRAR EVOLUCIÓN
						</Button>
					</div>

					<ClinicalEvolution
						patientName={`${selectedPatient.first_name} ${selectedPatient.last_name}`}
						patientId={selectedPatient.document_id}
						newEvolution={newEvolution}
						setNewEvolution={setNewEvolution}
					/>
				</div>
			</div>
		)
	}

	// 7. VISTA LISTADO
	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-gray-800">Pacientes</h1>
				<p className="text-gray-600 mt-2">
					Gestiona las historias médicas de tus pacientes
				</p>
			</div>

			<PatientSearchBar setSearchTerm={setSearchTerm} />

			<div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
				<h3 className="text-xl font-bold text-gray-800 mb-6 px-2">
					Historias Médicas
				</h3>

				<div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 p-2">
					<Button
						type="button"
						variant="default"
						onClick={handleCreatePatient}
						className="!w-full !h-100 !rounded-[2.5rem] !border-2 !border-dashed border-gray-300 !flex !flex-col !items-center !justify-center !p-4 hover:!border-primary hover:!bg-primary/5 !bg-white !shadow-sm group"
					>
						<CiSquarePlus className="text-primary w-14 h-14 transition-transform duration-300 group-hover:scale-110" />
						<span className="text-gray-400 mt-2 font-black uppercase text-xs tracking-widest group-hover:text-primary">
							Nuevo Registro
						</span>
					</Button>

					{filteredRecords.map((record) => (
						<div key={record.document_id} className="relative group">
							{/* Card is a div so the edit Button can live inside without nested buttons */}
							{/* biome-ignore lint/a11y/useSemanticElements: card contains edit Button; nested <button> is invalid */}
							<div
								role="button"
								tabIndex={0}
								onClick={() => {
									setSelectedPatient(record)
									setView("details")
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault()
										setSelectedPatient(record)
										setView("details")
									}
								}}
								className="w-full h-100 bg-gray-50 rounded-[2.5rem] shadow-sm border border-gray-200 p-8 hover:shadow-xl hover:border-primary hover:bg-white transition-all duration-300 flex flex-col text-left cursor-pointer overflow-hidden relative"
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
											{formatPhoneDisplay(record.phone ?? "")}
										</p>
									</div>
								</div>

								<div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-end w-full gap-3">
									<div className="flex flex-col min-w-0">
										<p className="text-[9px] text-gray-400 uppercase font-black mb-1">
											Fecha de Nacimiento
										</p>
										<p className="text-xs text-gray-600 flex items-center font-bold">
											<CiCalendar className="mr-2 text-primary w-5 h-5 shrink-0" />
											{record.birthdate.toLocaleDateString("es-ES", {
												day: "2-digit",
												month: "long",
												year: "numeric",
											})}
										</p>
									</div>
									<Button
										type="button"
										variant="text"
										onClick={(e) => {
											e.stopPropagation()
											handleEditPatient(e, record)
										}}
										icon={<LuPencilLine className="h-6 w-6" />}
										className="!p-2 !min-w-0 shrink-0 bg-white border border-gray-100 text-gray-400 hover:!text-primary hover:!border-primary hover:!shadow-lg rounded-2xl shadow-md"
										title="Editar información del paciente"
									/>
								</div>
							</div>
						</div>
					))}

					{/* Opcional: Mostrar un mensaje si no hay resultados */}
					{filteredRecords.length === 0 && searchTerm !== "" && (
						<div className="col-span-full text-center py-10 text-gray-400">
							No se encontraron pacientes que coincidan con "{searchTerm}"
						</div>
					)}
				</div>
			</div>

			<PatientModalForm
				isOpen={isPatientModalOpen}
				onClose={() => setIsPatientModalOpen(false)}
				patient={patientToEdit}
				onSave={handleSavePatient}
			/>
		</div>
	)
}

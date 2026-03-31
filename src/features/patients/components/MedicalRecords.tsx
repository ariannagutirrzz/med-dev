import { Pagination } from "antd"
import { useCallback, useEffect, useState } from "react"
import { CiCalendar, CiMail, CiPhone, CiSquarePlus } from "react-icons/ci"
import {
	LuArrowLeft,
	LuPencilLine,
	LuPlus,
	LuStethoscope,
} from "react-icons/lu"
import type { Patient } from "../../../shared"
import {
	Button,
	calcularEdad,
	DataFilterPanel,
	formatPhoneDisplay,
} from "../../../shared"
import LoadingSpinner from "../../../shared/components/common/LoadingSpinner"
import { useAuth } from "../../auth"
import { getDoctorPatients, getPatients } from "../services/PatientsAPI"
import { getDoctors } from "../services/UsersAPI"
import ClinicalEvolution from "./ClinicalEvolution"
import PatientModalForm from "./PatientModalForm"

type DoctorOption = { document_id: string; name: string }

export default function MedicalRecords() {
	// 2. ESTADOS (Iniciamos records vacío)
	const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
	const [view, setView] = useState<"list" | "details">("list")
	const [newEvolution, setNewEvolution] = useState<boolean>(false)
	const [isPatientModalOpen, setIsPatientModalOpen] = useState(false)
	const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null)
	const [records, setRecords] = useState<Patient[]>([])
	const [searchTerm, setSearchTerm] = useState("")
	const [doctorFilter, setDoctorFilter] = useState("all")
	const [doctorOptions, setDoctorOptions] = useState<DoctorOption[]>([])
	const { user } = useAuth()
	const [currentPage, setCurrentPage] = useState(1)
	const [isLoading, setIsLoading] = useState(false)
	const pageSize = 7 // Número de pacientes por página
	const isAdmin = user?.role === "Admin"

	useEffect(() => {
		if (!isAdmin) {
			setDoctorOptions([])
			return
		}
		getDoctors()
			.then((data: { doctors?: DoctorOption[] }) => {
				setDoctorOptions(data?.doctors ?? [])
			})
			.catch(() => setDoctorOptions([]))
	}, [isAdmin])

	// 3. FUNCIÓN DE CARGA (Memoizada para evitar errores de linter y re-renders)
	const loadPatients = useCallback(async () => {
		try {
			setIsLoading(true)
			let data: { patients: Patient[] }
			if (isAdmin) {
				data = await getPatients(
					doctorFilter === "all" ? undefined : doctorFilter,
				)
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
		} finally {
			setIsLoading(false)
		}
	}, [isAdmin, doctorFilter])

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

	const filteredRecords = records
		.filter((record) => {
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
		.sort((a, b) => {
			const ua = a.is_unassigned ? 1 : 0
			const ub = b.is_unassigned ? 1 : 0
			if (ua !== ub) return ub - ua
			return `${a.last_name} ${a.first_name}`.localeCompare(
				`${b.last_name} ${b.first_name}`,
				"es",
			)
		})

	// Lógica de paginación
	const indexOfLastRecord = currentPage * pageSize
	const indexOfFirstRecord = indexOfLastRecord - pageSize
	const currentRecords = filteredRecords.slice(
		indexOfFirstRecord,
		indexOfLastRecord,
	)

	// IMPORTANTE: Resetear a la página 1 cuando el usuario busca o cambia filtro médico
	// biome-ignore lint/correctness/useExhaustiveDependencies: false positive
	useEffect(() => {
		setCurrentPage(1)
	}, [searchTerm, doctorFilter])

	// 6. VISTA DETALLE
	if (view === "details" && selectedPatient) {
		return (
			<div className="p-6">
				<div className="animate-in fade-in duration-300">
					{/* Header: Volver a la izquierda, acción principal a la derecha */}
					<div className="flex justify-between items-center gap-4 mb-2">
						<Button
							type="button"
							variant="default"
							onClick={handleBack}
							icon={<LuArrowLeft className="w-4 h-4" />}
							className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg"
						>
							Volver
						</Button>
						<Button
							type="button"
							onClick={() => setNewEvolution(true)}
							icon={<LuPlus className="w-4 h-4" />}
							className="px-5! py-2.5! rounded-lg! font-semibold! text-sm!"
						>
							Registrar evolución
						</Button>
					</div>
					<p className="text-sm text-gray-500 mb-6">
						Paciente: {selectedPatient.first_name} {selectedPatient.last_name}
					</p>

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

			<DataFilterPanel
				className="mb-6"
				searchPlaceholder="Buscar paciente por nombre, DNI o historial..."
				searchValue={searchTerm}
				onSearchChange={setSearchTerm}
				filters={
					isAdmin && doctorOptions.length > 0
						? [
								{
									id: "doctor",
									value: doctorFilter,
									onChange: setDoctorFilter,
									placeholder: "Médico (evoluciones)",
									selectClassName: "w-full sm:w-[240px]",
									options: [
										{ value: "all", label: "Todos los médicos" },
										...doctorOptions.map((d) => ({
											value: d.document_id,
											label: d.name,
										})),
									],
								},
							]
						: undefined
				}
			/>

			<div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
				<h3 className="text-xl font-bold text-gray-800 mb-6 px-2">
					Historias Médicas
				</h3>

				{isLoading ? (
					<LoadingSpinner loadingMessage="CARGANDO PACIENTES..." />
				) : (
					<div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 p-1">
						<Button
							type="button"
							variant="default"
							onClick={handleCreatePatient}
							className="w-full! min-h-[280px]! h-full! rounded-2xl! border-2! border-dashed! border-gray-300 flex! flex-col! items-center! justify-center! p-4! hover:border-primary! hover:bg-primary/5! bg-white! shadow-sm! group"
						>
							<CiSquarePlus className="text-primary w-10 h-10 transition-transform duration-300 group-hover:scale-110" />
							<span className="text-gray-400 mt-1.5 font-bold uppercase text-[10px] tracking-wider group-hover:text-primary">
								Nuevo Registro
							</span>
						</Button>

						{currentRecords.map((record, cardIndex) => (
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
									className={`w-full min-h-[280px] h-full rounded-2xl shadow-sm p-4 transition-all duration-300 flex flex-col text-left cursor-pointer overflow-hidden ${
										record.is_unassigned
											? "bg-primary/10 border-2 border-dashed border-primary/45 hover:border-primary hover:bg-primary/5"
											: "bg-gray-50 border border-gray-200 hover:shadow-lg hover:border-primary hover:bg-white"
									}`}
								>
									<div className="flex justify-between items-start gap-2 mb-3 w-full">
										<h4 className="text-base font-bold text-gray-800 leading-snug group-hover:text-primary transition-colors pr-1">
											{record.first_name} <br /> {record.last_name}
										</h4>
										<div className="flex flex-col items-end gap-1 shrink-0">
											{record.is_unassigned ? (
												<span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/20 text-primary-green uppercase tracking-wide">
													Sin asignar
												</span>
											) : null}
											<span
												className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
													record.gender === "M"
														? "bg-blue-100 text-blue-600"
														: "bg-pink-100 text-pink-600"
												}`}
											>
												{record.gender}
											</span>
										</div>
									</div>

									<div className="flex-1 space-y-2.5 w-full">
										<div className="flex flex-col gap-2">
											<div>
												<p className="text-[9px] text-gray-400 uppercase font-semibold tracking-wide">
													Identificación
												</p>
												<p className="text-gray-700 text-xs font-semibold">
													{record.document_id}
												</p>
											</div>
											<div>
												<p className="text-[9px] text-gray-400 uppercase font-semibold tracking-wide">
													Edad
												</p>
												<p className="text-gray-700 text-xs font-semibold">
													{calcularEdad(record.birthdate)} años
												</p>
											</div>
										</div>

										<div className="border-t border-gray-100 pt-2 space-y-1">
											<p className="text-gray-500 text-[11px] flex items-center gap-2 italic truncate min-w-0">
												<CiMail className="text-primary w-3.5 h-3.5 shrink-0" />
												<span className="truncate">{record.email}</span>
											</p>
											<p className="text-gray-500 text-[11px] flex items-center gap-2 font-medium">
												<CiPhone className="text-primary w-3.5 h-3.5 shrink-0" />
												{formatPhoneDisplay(record.phone ?? "")}
											</p>
										</div>
									</div>

									<div className="mt-auto pt-1.5 border-t border-gray-100 w-full">
										<div className="flex flex-wrap items-end justify-between gap-x-2 gap-y-0.5">
											<div className="min-w-0">
												<p className="text-[8px] text-gray-400 uppercase font-semibold mb-px leading-none">
													Nacimiento
												</p>
												<p className="text-[11px] text-gray-700 flex items-center gap-1 font-semibold leading-tight">
													<CiCalendar className="text-primary w-3.5 h-3.5 shrink-0" />
													{record.birthdate.toLocaleDateString("es-ES", {
														day: "2-digit",
														month: "short",
														year: "numeric",
													})}
												</p>
											</div>
											{record.is_unassigned ? (
												<div className="text-right min-w-0 max-w-[58%]">
													<p className="text-[8px] text-gray-400 uppercase font-semibold mb-px leading-none">
														Estado
													</p>
													<p className="text-[10px] text-primary-green font-semibold leading-snug">
														Sin médico asignado
													</p>
													<p className="text-[9px] text-gray-500 leading-tight mt-0.5 line-clamp-2">
														La primera cita, cirugía o evolución con usted los
														vincula.
													</p>
												</div>
											) : record.attending_doctors &&
												record.attending_doctors.trim() !== "" ? (
												<div className="text-right min-w-0 max-w-[58%]">
													<p className="text-[8px] text-gray-400 uppercase font-semibold mb-px flex items-center justify-end gap-1 leading-none">
														<LuStethoscope className="w-3 h-3 text-primary" />
														Médicos
													</p>
													<p className="text-[10px] text-gray-700 font-medium leading-snug line-clamp-2">
														{record.attending_doctors}
													</p>
												</div>
											) : null}
										</div>

										<div className="mt-1.5 flex items-center justify-between gap-2 border-t border-gray-100 pt-1.5">
											<div className="flex h-8 shrink-0 items-center gap-1.5 text-sm font-normal tabular-nums leading-none text-gray-700">
												<span className="text-sm font-normal uppercase text-gray-500">
													N.º
												</span>
												<span className="text-sm font-normal">
													{indexOfFirstRecord + cardIndex + 1}
												</span>
											</div>
											<Button
												type="button"
												variant="text"
												size="small"
												onClick={(e) => {
													e.stopPropagation()
													handleEditPatient(e, record)
												}}
												icon={
													<LuPencilLine className="h-4 w-4 text-gray-600" />
												}
												className="flex! size-8! min-h-8! min-w-8! max-h-8! max-w-8! shrink-0 items-center! justify-center! p-0! leading-none! bg-white! border! border-gray-200! text-gray-600 hover:text-primary! hover:border-primary! rounded-lg! shadow-sm"
												title="Editar información del paciente"
											/>
										</div>
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
				)}

				<div className="mt-8 flex w-full justify-center pb-4 px-2">
					<Pagination
						current={currentPage}
						total={filteredRecords.length}
						pageSize={pageSize}
						onChange={(page) => setCurrentPage(page)}
						showSizeChanger={false} // Para mantenerlo simple
						className="custom-pagination"
					/>
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

import { useCallback, useEffect, useMemo, useState } from "react"
import {
	LuActivity,
	LuCalendarDays,
	LuChevronRight,
	LuClipboardList,
	LuFileText,
	LuStethoscope,
	LuUser,
} from "react-icons/lu"
import { toast } from "react-toastify"
import type { MedicalHistory, MedicalHistoryFormData } from "../../../shared"
import LoadingSpinner from "../../../shared/components/common/LoadingSpinner"
import { useAuth } from "../../auth"
import {
	createMedicalRecord,
	deleteMedicalRecordById,
	getMedicalRecord,
	updateMedicalRecordById,
} from "../services/MedicalRecordsAPI"
import { truncatePreview } from "../utils/truncatePreview"
import ClinicalEvolutionDetailModal from "./ClinicalEvolutionDetailModal"

const PREVIEW_MOTIVO_CHARS = 90
const PREVIEW_DIAGNOSIS_CHARS = 120
const PREVIEW_TREATMENT_CHARS = 120

export default function ClinicalEvolution({
	patientId,
	newEvolution,
	setNewEvolution,
}: {
	patientName: string
	patientId: string
	newEvolution: boolean
	setNewEvolution: React.Dispatch<React.SetStateAction<boolean>>
}) {
	const [evolutions, setEvolutions] = useState<MedicalHistory[]>([])
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedRecord, setSelectedRecord] = useState<
		MedicalHistory | MedicalHistoryFormData | null
	>(null)
	const [isLoading, setIsLoading] = useState(true)

	const { user } = useAuth()
	/** Cédula / documento del usuario (coincide con `doctor_id` en BD y lista de médicos), no el id numérico del JWT */
	const sessionDoctorDocumentId = user?.document_id
		? String(user.document_id)
		: ""

	const displayEvolutions = useMemo(
		() =>
			[...evolutions].sort(
				(a, b) =>
					new Date(b.record_date).getTime() - new Date(a.record_date).getTime(),
			),
		[evolutions],
	)

	const fetchEvolutions = useCallback(async () => {
		try {
			setIsLoading(true)
			const data = await getMedicalRecord(patientId)
			setEvolutions(data.history)
		} catch (error) {
			console.error("Error loading clinical evolution:", error)
			toast.error("Error al cargar el historial clínico")
		} finally {
			setIsLoading(false)
		}
	}, [patientId])

	useEffect(() => {
		fetchEvolutions()
	}, [fetchEvolutions])

	useEffect(() => {
		if (newEvolution) {
			const newRecord: MedicalHistoryFormData = {
				patient_id: patientId,
				doctor_id: sessionDoctorDocumentId,
				doctor_name: user?.name ? String(user.name) : undefined,
				record_date: new Date(),
				diagnosis: "",
				treatment: "",
				notes: "",
				reason: "",
				background: "",
				physical_exam: "",
			}
			setSelectedRecord(newRecord)
			setIsModalOpen(true)
		}
	}, [newEvolution, patientId, sessionDoctorDocumentId, user?.name])

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setSelectedRecord(null)
		setNewEvolution(false)
	}

	const handleSaveRecord = async (formData: MedicalHistoryFormData) => {
		try {
			const data = new FormData()
			Object.entries(formData).forEach(([key, value]) => {
				if (value !== null && value !== undefined) {
					if (value instanceof File) {
						data.append(key, value)
					} else if (value instanceof Date) {
						data.append(key, value.toISOString())
					} else {
						data.append(key, String(value))
					}
				}
			})

			if (formData.id) {
				await updateMedicalRecordById(formData.id, data)
				toast.success("Evolución actualizada")
			} else {
				await createMedicalRecord(data)
				toast.success("Nueva evolución registrada")
			}

			await fetchEvolutions()
			handleCloseModal()
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Error al guardar"
			toast.error(message)
		}
	}

	const handleDeleteRecord = async (id: number) => {
		try {
			await deleteMedicalRecordById(id)
			toast.success("Registro eliminado")
			await fetchEvolutions()
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Error al eliminar"
			toast.error(message)
			throw error
		}
	}

	return (
		<div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 shadow-lg shadow-gray-200/40 min-h-screen">
			{/* 1. TIMELINE SUPERIOR (Indicador Visual) */}
			{!isLoading && evolutions.length > 0 && (
				<div className="mb-5 px-1">
					<div className="flex items-center gap-2 mb-2">
						<LuActivity className="text-primary w-4 h-4" />
						<span className="text-sm font-semibold uppercase tracking-wider text-gray-400">
							Evolución Clínica
						</span>
					</div>
					<div className="relative h-1 w-full bg-gray-100 rounded-full overflow-hidden">
						<div className="absolute top-0 left-0 h-full bg-primary w-full transition-all duration-1000" />
					</div>
				</div>
			)}

			{/* 3. CONTENIDO PRINCIPAL */}
			{isLoading ? (
				<div className="flex flex-col items-center justify-center py-32 gap-4">
					<LoadingSpinner />
					<p className="text-gray-400 animate-pulse font-bold text-xs uppercase tracking-widest">
						Sincronizando Historial...
					</p>
				</div>
			) : evolutions.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-32 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-200">
					<LuClipboardList className="w-16 h-16 text-primary mb-6" />
					<p className="text-gray-400 font-black uppercase text-sm tracking-widest">
						Sin registros previos
					</p>
				</div>
			) : displayEvolutions.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-24 bg-amber-50/40 rounded-[2.5rem] border border-dashed border-amber-200/80 text-center px-6">
					<p className="text-gray-600 font-semibold">
						No hay evoluciones registradas por el médico seleccionado.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
					{displayEvolutions.map((evo, index) => {
						const caseNumber = displayEvolutions.length - index
						return (
							<button
								type="button"
								key={evo.id}
								onClick={() => {
									setSelectedRecord(evo)
									setIsModalOpen(true)
								}}
								className="group relative min-h-[270px] bg-gray-50/80 rounded-2xl border border-gray-100 p-4 hover:bg-white hover:shadow-md hover:shadow-primary/5 hover:border-primary transition-all duration-300 cursor-pointer flex flex-col overflow-hidden text-left"
								style={{ transform: "translateZ(0)" }}
							>
								{/* Motivo + caso: misma fila; contenido alineado al borde izquierdo del padding */}
								<div className="flex justify-between items-start gap-3 min-h-0">
									<div className="min-w-0 flex-1 text-left">
										<span className="text-[9px] font-semibold text-primary uppercase tracking-wide mb-0.5 block">
											Motivo
										</span>
										<h3 className="text-sm font-semibold text-gray-800 leading-snug wrap-break-word">
											{truncatePreview(
												evo.reason || "Consulta de rutina",
												PREVIEW_MOTIVO_CHARS,
											)}
										</h3>
									</div>
									<div className="flex items-baseline gap-1 shrink-0 pt-0.5">
										<span className="text-[9px] font-normal text-gray-400 uppercase tracking-wide">
											Caso
										</span>
										<span className="text-sm font-normal text-gray-700 tabular-nums leading-none">
											{caseNumber}
										</span>
									</div>
								</div>

								{/* Cuerpo */}
								<div className="flex-1 flex flex-col gap-2.5 min-h-0 mt-2.5">
									<div className="space-y-2">
										<div className="flex items-start gap-2">
											<div
												className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15"
												aria-hidden
											>
												<LuStethoscope className="h-3.5 w-3.5 text-primary" />
											</div>
											<div className="min-w-0 flex-1">
												<span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">
													Diagnóstico
												</span>
												<span className="text-[11px] text-gray-600 font-medium leading-snug block mt-0.5 wrap-break-word">
													{truncatePreview(
														evo.diagnosis,
														PREVIEW_DIAGNOSIS_CHARS,
													)}
												</span>
											</div>
										</div>

										<div className="flex items-start gap-2">
											<div
												className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15"
												aria-hidden
											>
												<LuFileText className="h-3.5 w-3.5 text-primary" />
											</div>
											<div className="min-w-0 flex-1">
												<span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">
													Tratamiento
												</span>
												<span className="text-[11px] text-gray-600 font-medium leading-snug block mt-0.5 wrap-break-word">
													{truncatePreview(
														evo.treatment,
														PREVIEW_TREATMENT_CHARS,
													)}
												</span>
											</div>
										</div>
									</div>
								</div>

								{/* Fecha y médico en una fila */}
								<div className="mt-auto pt-3 border-t border-gray-100 flex items-end justify-between gap-2">
									<div className="flex flex-1 flex-wrap items-end justify-between gap-x-3 gap-y-1 min-w-0">
										<div className="min-w-0">
											<p className="text-[8px] font-semibold text-gray-400 uppercase mb-0.5 flex items-center gap-1">
												<LuCalendarDays
													className="w-3 h-3 text-primary shrink-0"
													aria-hidden
												/>
												Fecha
											</p>
											<p className="text-[11px] font-medium text-gray-700">
												{new Date(evo.record_date).toLocaleDateString("es-ES", {
													day: "2-digit",
													month: "short",
													year: "numeric",
												})}
											</p>
										</div>
										<div className="text-right min-w-0 max-w-[58%]">
											<p className="text-[8px] font-semibold text-gray-400 uppercase mb-0.5 flex items-center justify-end gap-1">
												<LuUser
													className="w-3 h-3 text-primary shrink-0"
													aria-hidden
												/>
												Médico
											</p>
											<p className="text-[11px] font-medium text-gray-800 line-clamp-2 leading-snug">
												{evo.doctor_name?.trim() || "—"}
											</p>
										</div>
									</div>
									<div className="w-8 h-8 shrink-0 rounded-full bg-white border border-gray-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
										<LuChevronRight className="w-4 h-4" />
									</div>
								</div>
							</button>
						)
					})}
				</div>
			)}

			<ClinicalEvolutionDetailModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				record={selectedRecord}
				onSave={handleSaveRecord}
				onDelete={handleDeleteRecord}
			/>
		</div>
	)
}

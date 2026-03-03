import { jwtDecode } from "jwt-decode"
import { useCallback, useEffect, useState } from "react"
import {
	LuActivity,
	LuCalendarDays,
	LuChevronRight,
	LuClipboardList,
	LuFileText,
	LuStethoscope,
} from "react-icons/lu"
import { toast } from "react-toastify"
import { getStoredToken } from "../../../config/axios"
import type {
	MedicalHistory,
	MedicalHistoryFormData,
	MyTokenPayload,
} from "../../../shared"
import LoadingSpinner from "../../../shared/components/common/LoadingSpinner"
import {
	createMedicalRecord,
	deleteMedicalRecordById,
	getMedicalRecord,
	updateMedicalRecordById,
} from "../services/MedicalRecordsAPI"
import ClinicalEvolutionDetailModal from "./ClinicalEvolutionDetailModal"

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

	const token = getStoredToken()
	const doctor_id = token ? jwtDecode<MyTokenPayload>(token).id : ""

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
				doctor_id: doctor_id,
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
	}, [newEvolution, patientId, doctor_id])

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
		<div className="bg-white rounded-[3rem] border border-gray-100 p-6 md:p-10 shadow-xl shadow-gray-200/50 min-h-screen">
			{/* 1. TIMELINE SUPERIOR (Indicador Visual) */}
			{!isLoading && evolutions.length > 0 && (
				<div className="mb-10 px-4">
					<div className="flex items-center gap-4 mb-4">
						<LuActivity className="text-primary w-5 h-5" />
						<span className="text-lg font-black uppercase tracking-[0.2em] text-gray-400">
							Evolución Clínica
						</span>
					</div>
					<div className="relative h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
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
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
					{evolutions.map((evo) => (
						<button
							type="button"
							key={evo.id}
							onClick={() => {
								setSelectedRecord(evo)
								setIsModalOpen(true)
							}}
							className="group relative h-[420px] bg-gray-50/50 rounded-[2.5rem] border border-gray-100 p-8 hover:bg-white hover:shadow-2xl hover:shadow-primary/10 hover:border-primary transition-all duration-500 cursor-pointer flex flex-col overflow-hidden isolate mask-image-radial-fade"
							style={{
								WebkitMaskImage: "-webkit-radial-gradient(white, black)",
								maskImage: "radial-gradient(white, black)",
								transform: "translateZ(0)",
							}}
						>
							{/* Decoración superior: Fecha */}
							<div className="flex justify-between items-start mb-8">
								<div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-50 group-hover:border-primary transition-colors">
									<LuCalendarDays className="w-6 h-6 text-primary" />
								</div>
								<div className="text-right">
									<p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter leading-none">
										Consulta
									</p>
									<p className="text-xl font-black text-gray-900 leading-none mt-1">
										#{evo.id}
									</p>
								</div>
							</div>

							{/* Cuerpo: Motivo y Diagnóstico */}
							<div className="flex-1 flex flex-col gap-6">
								<div>
									<span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-2 block">
										Motivo
									</span>
									<h3 className="text-lg font-bold text-gray-800 leading-tight line-clamp-2">
										{evo.reason || "Consulta de rutina"}
									</h3>
								</div>

								<div className="space-y-4">
									<div className="flex items-start justify-start gap-2">
										<div className="bg-primary/20 p-1.5 rounded-lg">
											<LuStethoscope className="w-4 h-4 text-primary" />
										</div>
										<div className="flex flex-col items-start justify-center gap-1">
											<span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
												Diagnóstico
											</span>
											<span className="text-xs text-gray-600 font-bold line-clamp-3 leading-relaxed">
												{evo.diagnosis}
											</span>
										</div>
									</div>

									<div className="flex items-start justify-start gap-2">
										<div className="bg-primary/20 p-1.5 rounded-lg">
											<LuFileText className="w-4 h-4 text-primary" />
										</div>
										<div className="flex flex-col items-start justify-center gap-1">
											<span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
												Tratamiento
											</span>
											<span className="text-xs text-gray-600 font-bold line-clamp-3 leading-relaxed">
												{evo.treatment}
											</span>
										</div>
									</div>
								</div>
							</div>

							{/* Footer del Card */}
							<div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
								<div className="flex flex-col">
									<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
										Fecha
									</span>
									<span className="text-xs font-black text-gray-700">
										{new Date(evo.record_date).toLocaleDateString("es-ES", {
											day: "2-digit",
											month: "short",
											year: "numeric",
										})}
									</span>
								</div>
								<div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
									<LuChevronRight className="w-5 h-5" />
								</div>
							</div>

							{/* Overlay decorativo en hover */}
							<div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 -z-10" />
						</button>
					))}
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

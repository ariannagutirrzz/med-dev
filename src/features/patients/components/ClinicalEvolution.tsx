import { jwtDecode } from "jwt-decode"
import { useCallback, useEffect, useState } from "react"
import { CiCalendar, CiMedicalCase, CiMedicalClipboard } from "react-icons/ci"
import { FaQuestion } from "react-icons/fa"
import { LuPencilLine } from "react-icons/lu"
import { toast } from "react-toastify"
import { getStoredToken } from "../../../config/axios"
import type {
	MedicalHistory,
	MedicalHistoryFormData,
	MyTokenPayload,
} from "../../../shared"
import {
	createMedicalRecord,
	deleteMedicalRecordById,
	getMedicalRecord,
	updateMedicalRecordById,
} from "../services/MedicalRecordsAPI"
import ClinicalEvolutionDetailModal from "./ClinicalEvolutionDetailModal"

export default function ClinicalEvolution({
	patientName,
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

	// 1. Cargar evoluciones desde el Backend
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

	// 2. Manejar la creación de una nueva evolución (Trigger desde el padre)
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

			// Iteramos sobre las llaves de forma segura
			Object.entries(formData).forEach(([key, value]) => {
				if (value !== null && value !== undefined) {
					if (value instanceof File) {
						// Si es un archivo (Rx o Tomografía)
						data.append(key, value)
					} else if (value instanceof Date) {
						// Convertimos la fecha a string para el backend
						data.append(key, value.toISOString())
					} else {
						// Para strings y números
						data.append(key, String(value))
					}
				}
			})

			if (formData.id) {
				// Edición: Usamos el ID del formData
				await updateMedicalRecordById(formData.id, data)
				toast.success("Evolución actualizada correctamente")
			} else {
				// Creación
				await createMedicalRecord(data)
				toast.success("Nueva evolución registrada")
			}

			await fetchEvolutions()
			handleCloseModal()
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Error al guardar"
			toast.error(message)
		}
	}

	const handleOpenDetail = (record: MedicalHistory) => {
		setSelectedRecord(record)
		setIsModalOpen(true)
	}

	const handleDeleteRecord = async (id: number) => {
		try {
			await deleteMedicalRecordById(id)
			toast.success("Evolución clínica eliminada con éxito")

			// Paso crucial: Refrescar la lista de registros después de borrar
			await fetchEvolutions()
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Error al eliminar"
			toast.error(message)
			throw error // Lanzamos el error para que el modal sepa que falló si es necesario
		}
	}
	return (
		<div className="bg-white rounded-2xl shadow-lg p-6 mb-6 min-h-screen">
			<div className="flex justify-between items-center mb-8">
				<h2 className="text-2xl font-black text-gray-800">
					Paciente:{" "}
					<span className="text-primary underline">{patientName}</span>
				</h2>
			</div>

			{isLoading ? (
				<div className="flex flex-col items-center justify-center py-20">
					<div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
					<p className="text-gray-400 font-bold animate-pulse">
						CARGANDO HISTORIAL...
					</p>
				</div>
			) : evolutions.length === 0 ? (
				<div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
					<p className="text-gray-400 font-medium">
						No hay registros de evolución para este paciente.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
					{evolutions.map((evo) => (
						<div
							key={evo.id}
							className="group bg-gray-100 rounded-3xl border-2 border-gray-300 p-6 hover:shadow-xl hover:border-primary hover:bg-white transition-all duration-300 flex flex-col"
						>
							{/* Header de la Card */}
							<div className="flex justify-between items-center mb-5">
								<div className="bg-primary/10 text-primary px-3 py-1.5 rounded-xl flex items-center gap-2">
									<CiCalendar className="w-5 h-5 font-bold" />
									<span className="text-sm font-black">
										{new Date(evo.record_date).toLocaleDateString()}
									</span>
								</div>
								<span className="text-lg font-black text-gray-700 uppercase">
									# {evo.id}
								</span>
							</div>

							{/* Contenido */}
							<div className="space-y-4 flex-1">
								<div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-100/50">
									<p className="text-[10px] text-purple-400 font-black uppercase mb-1 flex items-center gap-1">
										<FaQuestion className="w-3 h-3" /> Mótivo de Consulta
									</p>
									<p className="text-gray-800 font-bold text-sm line-clamp-1">
										{evo.reason}
									</p>
								</div>
								<div className="bg-red-50/50 p-3 rounded-2xl border border-red-100/50">
									<p className="text-[10px] text-red-400 font-black uppercase mb-1 flex items-center gap-1">
										<CiMedicalCase className="w-3 h-3" /> Diagnóstico
									</p>
									<p className="text-gray-800 font-bold text-sm line-clamp-1">
										{evo.diagnosis}
									</p>
								</div>

								<div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50">
									<p className="flex items-center gap-1 text-[10px] text-blue-400 font-black uppercase mb-1">
										<CiMedicalClipboard className="w-3 h-3" /> Tratamiento
									</p>
									<p className="text-gray-700 text-sm line-clamp-2">
										{evo.treatment}
									</p>
								</div>
							</div>

							{/* Acciones */}
							<div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-end">
								<div className="text-[9px] text-gray-400">
									<p>Creado: {new Date(evo.created_at).toLocaleDateString()}</p>
								</div>
								<button
									type="button"
									onClick={() => handleOpenDetail(evo)}
									className="bg-gray-100 p-2.5 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors cursor-pointer"
								>
									<LuPencilLine className="w-5 h-5" />
								</button>
							</div>
						</div>
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

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
import { Button } from "../../../shared"
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
		<div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 min-h-screen">
			{isLoading ? (
				<LoadingSpinner loadingMessage="Cargando Historial..." />
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
							className="group bg-gray-50 rounded-xl border-2 border-gray-200 p-5 hover:shadow-md hover:border-primary transition-all duration-200 flex flex-col"
						>
							{/* Header de la Card */}
							<div className="flex justify-between items-center mb-4">
								<div className="flex items-center gap-2 text-gray-600">
									<CiCalendar className="w-4 h-4 text-primary" />
									<span className="text-sm font-bold">
										{new Date(evo.record_date).toLocaleDateString()}
									</span>
								</div>
								<span className="text-md font-bold text-primary">
									#{evo.id}
								</span>
							</div>

							{/* Contenido */}
							<div className="space-y-3 flex-1">
								<div className="bg-white p-3 rounded-lg border border-primary">
									<p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1 flex items-center gap-1.5">
										<FaQuestion className="w-3 h-3 text-primary" /> Motivo de
										consulta
									</p>
									<p className="text-gray-800 text-sm line-clamp-1">
										{evo.reason}
									</p>
								</div>
								<div className="bg-white p-3 rounded-lg border border-primary">
									<p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1 flex items-center gap-1.5">
										<CiMedicalCase className="w-3 h-3 text-primary" />{" "}
										Diagnóstico
									</p>
									<p className="text-gray-800 text-sm line-clamp-1">
										{evo.diagnosis}
									</p>
								</div>
								<div className="bg-white p-3 rounded-lg border border-primary">
									<p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1 flex items-center gap-1.5">
										<CiMedicalClipboard className="w-3 h-3 text-primary" />{" "}
										Tratamiento
									</p>
									<p className="text-gray-700 text-sm line-clamp-2">
										{evo.treatment}
									</p>
								</div>
							</div>

							{/* Acciones */}
							<div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-end">
								<div className="text-xs text-gray-400">
									Creado: {new Date(evo.created_at).toLocaleDateString()}
								</div>
								<Button
									type="button"
									variant="text"
									onClick={() => handleOpenDetail(evo)}
									icon={<LuPencilLine className="w-4 h-4 text-gray-500" />}
									className="p-2! min-w-0! rounded-lg! text-gray-500! hover:border-primary! hover:text-primary!"
								/>
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

import { useEffect, useState } from "react"
import { CiCalendar, CiMedicalCase, CiStickyNote } from "react-icons/ci"
import { LuClock, LuPencilLine } from "react-icons/lu"
import type { MedicalHistory } from "../../types" // Asegúrate de que la ruta sea correcta
import ClinicalEvolutionDetailModal from "./ClinicalEvolutionDetailModal" // Ajusta la ruta

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
	// 1. Estados para el Modal
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedRecord, setSelectedRecord] = useState<MedicalHistory | null>(
		null,
	)

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setSelectedRecord(null)
		setNewEvolution(false)
	}

	useEffect(() => {
		if (newEvolution) {
			// Lógica para manejar una nueva evolución clínica
			const newRecord: MedicalHistory = {
				id: 2, // ID temporal
				patient_id: patientId,
				doctor_id: "currentDoctorId", // Reemplaza con el ID real del doctor
				record_date: new Date(),
				diagnosis: "",
				treatment: "",
				notes: "",
				created_at: new Date(),
				updated_at: new Date(),
			}
			setSelectedRecord(newRecord)
			setIsModalOpen(true)
		}
	}, [newEvolution, patientId])
	// Datos de prueba (ahora usando el tipo MedicalHistory que ya tienes definido)
	const [evolutions, setEvolutions] = useState<MedicalHistory[]>([
		{
			id: 450,
			patient_id: "1",
			doctor_id: "12",
			record_date: new Date("2026-01-20"),
			diagnosis: "Hipertensión Arterial Grado 1",
			treatment: "Enalapril 10mg cada 12 horas por 30 días.",
			notes: "Paciente refiere cefalea ocasional. Se solicita perfil lipídico.",
			reason: "Control de presión arterial",
			background: "Padre hipertenso",
			physical_exam: "TA: 140/90 mmHg",
			created_at: new Date("2026-01-20T10:00:00"),
			updated_at: new Date("2026-01-21T08:30:00"),
		},
	])

	// 2. Manejadores de eventos
	const handleOpenDetail = (record: MedicalHistory) => {
		setSelectedRecord(record)
		setIsModalOpen(true)
	}

	const handleSaveRecord = (updatedRecord: MedicalHistory) => {
		// Aquí actualizarías tu estado local o harías la petición al API
		setEvolutions((prev) =>
			prev.map((evo) => (evo.id === updatedRecord.id ? updatedRecord : evo)),
		)
		console.log("Registro actualizado:", updatedRecord)
	}

	return (
		<div className="p-6 bg-white min-h-screen">
			{/* Cabecera */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
				<div>
					<h2 className="text-2xl font-black text-gray-800 tracking-tight">
						Paciente:{" "}
						<span className="font-bold text-primary underline decoration-2 underline-offset-4">
							{patientName}
						</span>
					</h2>
				</div>
			</div>

			{/* Grid de Evoluciones */}
			<div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
				{evolutions.map((evo) => (
					<div
						key={evo.id}
						className="group bg-gray-100 rounded-3xl border-2 border-gray-300 p-6 shadow-sm hover:shadow-xl hover:border-primary hover:bg-white transition-all duration-300 flex flex-col"
					>
						{/* Fecha y ID */}
						<div className="flex justify-between items-center mb-5">
							<div className="bg-primary/10 text-primary px-3 py-1.5 rounded-xl flex items-center gap-2">
								<CiCalendar className="w-5 h-5 font-bold" />
								<span className="text-sm font-black">
									{evo.record_date.toLocaleDateString("es-ES", {
										day: "2-digit",
										month: "long",
										year: "numeric",
									})}
								</span>
							</div>
							<span className="text-[10px] font-black text-gray-300">
								REC-#{evo.id}
							</span>
						</div>

						{/* Contenido Clínico */}
						<div className="space-y-4 flex-1">
							<div className="bg-red-50/50 p-3 rounded-2xl border border-red-100/50">
								<p className="text-[10px] text-red-400 font-black uppercase mb-1 flex items-center gap-1">
									<CiMedicalCase className="w-4 h-4" /> Diagnóstico
								</p>
								<p className="text-gray-800 font-bold text-sm line-clamp-1">
									{evo.diagnosis}
								</p>
							</div>

							<div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100/50">
								<p className="text-[10px] text-blue-400 font-black uppercase mb-1 flex items-center gap-1">
									Tratamiento Sugerido
								</p>
								<p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
									{evo.treatment}
								</p>
							</div>

							<div>
								<p className="text-[10px] text-gray-400 font-black uppercase mb-1 flex items-center gap-1">
									<CiStickyNote className="w-4 h-4" /> Observaciones
								</p>
								<p className="text-gray-500 text-xs italic line-clamp-2">
									"{evo.notes}"
								</p>
							</div>
						</div>

						{/* Footer con Metadatos */}
						<div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-end">
							<div className="space-y-1">
								<p className="text-[9px] text-gray-400 flex items-center gap-1">
									<LuClock className="w-3 h-3" /> Creado:{" "}
									{evo.created_at.toLocaleDateString()}
								</p>
								<p className="text-[9px] text-gray-400 flex items-center gap-1">
									<LuClock className="w-3 h-3" /> Modificado:{" "}
									{evo.updated_at.toLocaleDateString()}
								</p>
							</div>
							{/* 3. Evento onClick para abrir el detalle */}
							<button
								onClick={() => handleOpenDetail(evo)}
								type="button"
								className="bg-gray-100 p-2.5 cursor-pointer rounded-xl group-hover:bg-primary group-hover:text-white transition-colors"
							>
								<LuPencilLine className="w-5 h-5" />
							</button>
						</div>
					</div>
				))}
			</div>

			{/* 4. Renderizado del Modal */}
			<ClinicalEvolutionDetailModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				record={selectedRecord}
				onSave={handleSaveRecord}
			/>
		</div>
	)
}

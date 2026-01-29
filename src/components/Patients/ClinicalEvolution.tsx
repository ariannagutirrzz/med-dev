import { useState } from "react"
import type { MedicalHistory } from "../../types"
import ClinicalEvolutionDetailModal from "./ClinicalEvolutionDetailModal"

export default function ClinicalEvolutions({
	patientName,
	patientId,
}: {
	patientName: string
	patientId: string
}) {
	// 1. Estado de las evoluciones (asumiendo que vienen de una lista inicial)
	const [evolutions, setEvolutions] = useState<MedicalHistory[]>([
		{
			id: 1,
			patient_id: "101",
			doctor_id: "5",
			record_date: new Date(),
			diagnosis: "Rinosinusitis aguda",
			treatment: "Amoxicilina 500mg cada 8h",
			notes: "Paciente refiere mejoría leve.",
			created_at: new Date(),
			updated_at: new Date(),
		},
	])

	// Estados para el Modal
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedRecord, setSelectedRecord] = useState<MedicalHistory | null>(
		null,
	)

	// 2. Función para guardar los cambios
	const handleSaveRecord = async (updatedRecord: MedicalHistory) => {
		try {
			// OPCIÓN A: Actualización local (UI inmediata)
			setEvolutions((prevEvolutions) =>
				prevEvolutions.map((record) =>
					record.id === updatedRecord.id ? updatedRecord : record,
				),
			)

			// OPCIÓN B: Llamada al backend (ejemplo con fetch/axios)
			/* await axios.put(`/api/records/${updatedRecord.id}`, updatedRecord);
            toast.success("Registro actualizado correctamente"); 
            */

			console.log("Registro guardado con éxito:", updatedRecord)
		} catch (error) {
			console.error("Error al guardar el registro:", error)
			// Aquí podrías mostrar una notificación de error al usuario
		}
	}

	const handleOpenDetail = (record: MedicalHistory) => {
		setSelectedRecord(record)
		setIsModalOpen(true)
	}

	return (
		<div className="p-6">
			<h3 className="text-xl font-bold mb-6 text-gray-800">
				Evoluciones de {patientName}
			</h3>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{evolutions.map((evo) => (
					<button
						type="button"
						key={evo.id}
						onClick={() => handleOpenDetail(evo)}
						className="group bg-white rounded-3xl border-2 border-gray-100 p-6 shadow-sm hover:border-primary hover:shadow-md transition-all text-left"
					>
						<div className="flex justify-between items-center mb-3">
							<span className="text-xs font-black text-primary uppercase">
								{evo.record_date.toLocaleDateString()}
							</span>
						</div>
						<p className="text-gray-700 font-bold line-clamp-2">
							{evo.diagnosis}
						</p>
						<p className="text-gray-400 text-sm mt-2 line-clamp-2 italic">
							{evo.treatment}
						</p>
					</button>
				))}
			</div>

			{/* 3. Inyección del Modal con la nueva prop onSave */}
			<ClinicalEvolutionDetailModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				record={selectedRecord}
				onSave={handleSaveRecord}
			/>
		</div>
	)
}

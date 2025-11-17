import { CiCalendar, CiSquarePlus } from "react-icons/ci"
import { LuPencilLine } from "react-icons/lu"

export default function MedicalRecords() {
	const records = [
		{
			id: 1,
			patientName: "Juan Perez",
			date: "2024-01-15",
			summary: "Consulta general",
		},
		{
			id: 2,
			patientName: "Maria Gomez",
			date: "2024-02-20",
			summary: "Control de diabetes",
		},
		{
			id: 3,
			patientName: "Carlos Ruiz",
			date: "2024-03-10",
			summary: "Revisión anual",
		},
		{
			id: 4,
			patientName: "Juan Perez",
			date: "2024-01-15",
			summary: "Consulta general",
		},
		{
			id: 5,
			patientName: "Maria Gomez",
			date: "2024-02-20",
			summary: "Control de diabetes",
		},
		{
			id: 6,
			patientName: "Carlos Ruiz",
			date: "2024-03-10",
			summary: "Revisión anual",
		},
	]

	return (
		<div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 auto-rows-fr">
			{/* Card vacío con contenedor para centrado */}
			<div className="relative w-full h-full min-h-80">
				<div className="group absolute bg-white rounded-2xl shadow-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-4 hover:border-gray-400 transition-all duration-300 cursor-pointer w-56 h-72 hover:w-full hover:h-full mx-auto my-auto left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 ">
					<CiSquarePlus className="text-primary w-12 h-12 transition-transform duration-300 group-hover:scale-110" />
				</div>
			</div>

			{records.map((record) => (
				<div
					key={record.id}
					className="group w-full h-full min-h-80 bg-gray-100 rounded-2xl shadow-md border-2 border-gray-300 p-4 hover:shadow-xl hover:border-primary hover:bg-white transition-all duration-300 cursor-pointer flex flex-col"
				>
					<div className="flex justify-center items-start mb-3">
						<h4 className="text-lg font-semibold text-gray-800">
							{record.patientName}
						</h4>
					</div>

					<div className="rounded-lg p-3 flex-1">
						<p className="text-gray-700 text-sm leading-relaxed">
							{record.summary}
						</p>
					</div>

					<div className="mt-4 flex justify-between items-center">
						<p className="text-sm text-gray-500 flex items-center">
							<CiCalendar className="inline mr-1 text-primary w-5 h-5" />
							{new Date(record.date).toLocaleDateString()}
						</p>
						<LuPencilLine className="h-7 w-7 text-gray-400 group-hover:scale-110 group-hover:text-primary transition-all duration-300" />
					</div>
				</div>
			))}
		</div>
	)
}

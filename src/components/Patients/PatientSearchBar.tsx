import { FaSearch } from "react-icons/fa"

type PatientHeaderProps = {
	setSearchTerm: React.Dispatch<React.SetStateAction<string>>
}

const PatientSearchBar = ({ setSearchTerm }: PatientHeaderProps) => {
	return (
		<div className="w-full bg-white p-1 rounded-2xl border border-gray-200 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary focus-within:border-primary mb-6">
			<div className="flex flex-row items-center">
				{/* 1. Input de Búsqueda de Pacientes */}
				<div className="relative flex-1 flex items-center">
					<FaSearch className="absolute left-4 text-gray-400" size={16} />
					<input
						type="text"
						placeholder="Buscar paciente por nombre, DNI o historial..."
						className="w-full pl-12 pr-4 py-3 bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
			</div>
		</div>
	)
}

export default PatientSearchBar

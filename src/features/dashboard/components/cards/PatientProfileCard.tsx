import { CiMail, CiUser } from "react-icons/ci"
import {
	FaAddressCard,
	FaMapMarkerAlt,
	FaPhone,
	FaTint,
	FaVenusMars,
} from "react-icons/fa"
import { MdCake } from "react-icons/md"
import type { User } from "../../../auth"

interface PatientProfileCardProps {
	user: User | null
	loading?: boolean
}

const formatDate = (dateStr?: string) => {
	if (!dateStr) return "—"
	try {
		const d = new Date(dateStr)
		return d.toLocaleDateString("es-ES", {
			day: "2-digit",
			month: "long",
			year: "numeric",
		})
	} catch {
		return dateStr
	}
}

const genderLabel = (gender?: string) =>
	gender === "F" ? "Femenino" : gender === "M" ? "Masculino" : "—"

const Row = ({
	icon: Icon,
	label,
	value,
}: {
	icon: React.ElementType
	label: string
	value: string
}) => (
	<div className="flex items-start gap-2 sm:gap-3 py-1.5 sm:py-2 border-b border-gray-100 last:border-0">
		<Icon className="text-primary text-sm sm:text-base mt-0.5 shrink-0" />
		<div className="min-w-0 flex-1">
			<p className="text-[11px] sm:text-xs text-gray-400 font-medium">{label}</p>
			<p className="text-xs sm:text-sm text-gray-800 break-words">{value || "—"}</p>
		</div>
	</div>
)

export const PatientProfileCard = ({ user, loading }: PatientProfileCardProps) => {
	if (loading) {
		return (
			<div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 flex flex-col min-h-[200px]">
				<h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
					<CiUser className="text-primary" />
					Mi información personal
				</h3>
				<div className="animate-pulse space-y-3 flex-1">
					<div className="h-10 bg-gray-200 rounded" />
					<div className="h-10 bg-gray-200 rounded" />
					<div className="h-10 bg-gray-200 rounded" />
				</div>
			</div>
		)
	}

	if (!user) {
		return (
			<div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 flex flex-col min-h-[200px]">
				<h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
					<CiUser className="text-primary" />
					Mi información personal
				</h3>
				<div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
					Cargando información...
				</div>
			</div>
		)
	}

	return (
		<div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 flex flex-col min-h-0">
			<h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2">
				<CiUser className="text-primary text-sm sm:text-base" />
				<span>Mi información personal</span>
			</h3>
			<div className="space-y-0">
				<Row icon={CiUser} label="Nombre" value={user.name} />
				<Row icon={CiMail} label="Correo" value={user.email} />
				<Row icon={FaAddressCard} label="Cédula / Documento" value={user.document_id || ""} />
				<Row icon={FaPhone} label="Teléfono" value={user.phone || ""} />
				<Row icon={MdCake} label="Fecha de nacimiento" value={formatDate(user.birthdate)} />
				<Row icon={FaVenusMars} label="Género" value={genderLabel(user.gender)} />
				<Row icon={FaMapMarkerAlt} label="Dirección" value={user.address || ""} />
				{user.blood_type && (
					<Row icon={FaTint} label="Tipo de sangre" value={user.blood_type} />
				)}
			</div>
		</div>
	)
}

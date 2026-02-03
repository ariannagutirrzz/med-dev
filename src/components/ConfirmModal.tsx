import { FaExclamationTriangle, FaTimes } from "react-icons/fa"

interface ConfirmModalProps {
	isOpen: boolean
	onClose: () => void
	onConfirm: () => void
	title?: string
	message: string | React.ReactNode
	confirmText?: string
	cancelText?: string
	variant?: "danger" | "warning"
}

const ConfirmModal = ({
	isOpen,
	onClose,
	onConfirm,
	title = "¿Estás seguro?",
	message,
	confirmText = "Confirmar",
	cancelText = "Cancelar",
	variant = "danger",
}: ConfirmModalProps) => {
	if (!isOpen) return null

	const colorClass =
		variant === "danger"
			? "bg-red-500 hover:bg-red-600 shadow-red-200"
			: "bg-orange-500 hover:bg-orange-600 shadow-orange-200"
	const iconClass =
		variant === "danger"
			? "bg-red-100 text-red-500"
			: "bg-orange-100 text-orange-500"

	return (
		<div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
			<div className="bg-white p-8 rounded-[2.5rem] max-w-sm w-full shadow-2xl text-center relative animate-in zoom-in duration-300">
				<button
					type="button"
					onClick={onClose}
					className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
				>
					<FaTimes />
				</button>

				<div
					className={`w-20 h-20 ${iconClass} rounded-full flex items-center justify-center mx-auto mb-6`}
				>
					<FaExclamationTriangle size={40} />
				</div>

				<h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>

				<div className="text-gray-500 mb-8 leading-relaxed">{message}</div>

				<div className="flex flex-col gap-3">
					<button
						type="button"
						onClick={onConfirm}
						className={`w-full py-4 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-lg ${colorClass} cursor-pointer`}
					>
						{confirmText}
					</button>
					<button
						type="button"
						onClick={onClose}
						className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors cursor-pointer"
					>
						{cancelText}
					</button>
				</div>
			</div>
		</div>
	)
}

export default ConfirmModal

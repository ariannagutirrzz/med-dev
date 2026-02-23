import { FaExclamationTriangle, FaTimes } from "react-icons/fa"
import Button from "./common/Button"

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

	const iconClass =
		variant === "danger"
			? "bg-red-100 text-red-500"
			: "bg-orange-100 text-orange-500"

	return (
		<div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
			<div className="bg-white p-8 rounded-[2.5rem] max-w-sm w-full shadow-2xl text-center relative animate-in zoom-in duration-300">
				<Button
					type="button"
					variant="text"
					onClick={onClose}
					className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 !p-0 !min-w-0 !h-auto"
				>
					<FaTimes />
				</Button>

				<div
					className={`w-20 h-20 ${iconClass} rounded-full flex items-center justify-center mx-auto mb-6`}
				>
					<FaExclamationTriangle size={40} />
				</div>

				<h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>

				<div className="text-gray-500 mb-8 leading-relaxed">{message}</div>

				<div className="flex flex-col gap-3">
					<Button
						type="button"
						danger
						onClick={onConfirm}
						block
						className="!py-4 font-black uppercase tracking-widest text-xs rounded-2xl"
					>
						{confirmText}
					</Button>
					<Button
						type="button"
						variant="default"
						onClick={onClose}
						block
						className="!py-4 font-bold rounded-2xl bg-gray-100 text-gray-600 border-0 hover:!bg-gray-200 hover:!text-gray-700"
					>
						{cancelText}
					</Button>
				</div>
			</div>
		</div>
	)
}

export default ConfirmModal

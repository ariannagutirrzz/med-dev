type LoadingSpinnerProps = {
	loadingMessage?: string
	className?: string
}

export default function LoadingSpinner({
	loadingMessage,
	className,
}: LoadingSpinnerProps) {
	return (
		<div
			className={`flex flex-col items-center justify-center py-20 ${className}`}
		>
			<div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
			<p className="text-gray-400 uppercase font-bold animate-pulse">
				{loadingMessage}
			</p>
		</div>
	)
}

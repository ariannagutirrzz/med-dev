import type { IconType } from "react-icons"

interface FeatureCardProps {
	icon: IconType
	title: string
	description: string
	color: "primary" | "secondary"
}

const FeatureCard = ({ icon: Icon, title, description, color }: FeatureCardProps) => {
	const colorClasses = {
		primary: {
			border: "border-primary",
			iconBg: "bg-primary/10",
			iconColor: "text-primary",
		},
		secondary: {
			border: "border-secondary",
			iconBg: "bg-secondary/10",
			iconColor: "text-secondary",
		},
	}

	const classes = colorClasses[color]

	return (
		<div
			className={`bg-white rounded-xl p-6 shadow-md transition-all duration-300 ease-in-out hover:scale-105 border-l-4 ${classes.border}`}
		>
			<div className="flex items-center gap-3 mb-4">
				<div
					className={`w-12 h-12 ${classes.iconBg} rounded-lg flex items-center justify-center shrink-0`}
				>
					<Icon className={`w-6 h-6 ${classes.iconColor}`} />
				</div>
				<h3 className="text-lg font-bold text-primary-dark">{title}</h3>
			</div>
			<p className="text-sm text-muted leading-relaxed">{description}</p>
		</div>
	)
}

export default FeatureCard


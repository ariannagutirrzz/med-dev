interface TreatmentCardProps {
	title: string
	description: string
	conditions?: string[]
}

const TreatmentCard = ({
	title,
	description,
	conditions,
}: TreatmentCardProps) => {
	return (
		<div className="bg-white rounded-xl shadow-md p-6 hover:shadow-[0_14px_30px_rgba(120,154,97,0.25)] transition-shadow duration-300 ease-in-out">
			<h3 className="text-xl font-bold text-primary-dark mb-3">{title}</h3>
			<p className="text-muted mb-4 leading-relaxed">{description}</p>
			{conditions && conditions.length > 0 && (
				<div>
					<p className="text-sm font-semibold text-primary-dark mb-2">
						Condiciones tratadas:
					</p>
					<ul className="list-disc list-inside space-y-1 text-sm text-muted">
						{conditions.map((condition, index) => (
							<li key={index}>{condition}</li>
						))}
					</ul>
				</div>
			)}
		</div>
	)
}

export default TreatmentCard

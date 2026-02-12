interface TeamCardProps {
	name: string
	title: string
	credentials: string
	experience: string
	description: string
	image: string
}

const TeamCard = ({
	name,
	title,
	credentials,
	experience,
	description,
	image,
}: TeamCardProps) => {
	return (
		<div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-[0_18px_40px_rgba(120,154,97,0.35)] hover:scale-105 transition-all duration-300 ease-in-out">
			<div className="h-70 bg-linear-to-br from-bg-light to-bg-card flex items-center justify-center overflow-hidden">
				<img
					src={image}
					alt={name}
					className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-110"
				/>
			</div>
			<div className="p-6">
				<h3 className="text-xl font-bold text-primary-dark mb-1">{name}</h3>
				<p className="text-primary font-semibold mb-2">{title}</p>
				<p className="text-sm text-muted mb-3">{credentials}</p>
				<p className="text-sm text-muted mb-4">{experience}</p>
				<p className="text-muted text-sm leading-relaxed">{description}</p>
			</div>
		</div>
	)
}

export default TeamCard

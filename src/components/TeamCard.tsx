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
		<div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
			<div className="h-64 bg-linear-to-br from-bg-light to-bg-card flex items-center justify-center overflow-hidden">
				<img src={image} alt={name} className="w-full h-full object-cover" />
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

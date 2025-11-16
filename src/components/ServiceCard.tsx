interface ServiceCardProps {
	title: string
	description: string
}

const ServiceCard = ({ title, description }: ServiceCardProps) => {
	return (
		<div className="bg-white p-4 rounded-xl shadow-md hover:shadow-[0_14px_30px_rgba(120,154,97,0.25)] transition-shadow duration-300 ease-in-out">
			<h3 className="font-semibold mb-2">{title}</h3>
			<p>{description}</p>
		</div>
	)
}

export default ServiceCard

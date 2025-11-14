interface ServiceCardProps {
	title: string
	description: string
}

const ServiceCard = ({ title, description }: ServiceCardProps) => {
	return (
		<div className="bg-white p-4 rounded-xl shadow">
			<h3 className="font-semibold mb-2">{title}</h3>
			<p>{description}</p>
		</div>
	)
}

export default ServiceCard


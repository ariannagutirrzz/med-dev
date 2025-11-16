import { FaStar } from "react-icons/fa"

interface TestimonialCardProps {
	name: string
	condition: string
	rating: number
	comment: string
}

const TestimonialCard = ({
	name,
	condition,
	rating,
	comment,
}: TestimonialCardProps) => {
	return (
		<div className="bg-white rounded-xl shadow-md p-6 hover:shadow-[0_14px_30px_rgba(120,154,97,0.25)] transition-shadow duration-300 ease-in-out">
			<div className="flex items-center gap-1 mb-4">
				{[0, 1, 2, 3, 4].map((starIndex) => (
					<FaStar
						key={`star-${starIndex}`}
						className={`w-5 h-5 ${
							starIndex < rating ? "text-yellow-400" : "text-gray-300"
						}`}
					/>
				))}
			</div>
			<p className="text-muted mb-4 leading-relaxed italic">"{comment}"</p>
			<div className="border-t border-gray-200 pt-4">
				<p className="font-semibold text-primary-dark">{name}</p>
				<p className="text-sm text-muted">{condition}</p>
			</div>
		</div>
	)
}

export default TestimonialCard

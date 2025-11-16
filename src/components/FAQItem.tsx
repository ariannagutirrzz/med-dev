import { useState } from "react"
import { FaChevronDown } from "react-icons/fa"

interface FAQItemProps {
	question: string
	answer: string
}

const FAQItem = ({ question, answer }: FAQItemProps) => {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<div className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
			>
				<h3 className="text-lg font-bold text-primary-dark flex-1">
					{question}
				</h3>
				<FaChevronDown
					className={`w-5 h-5 text-primary transition-transform shrink-0 ${
						isOpen ? "rotate-180" : ""
					}`}
				/>
			</button>
			<div
				className={`overflow-hidden transition-all duration-300 ease-in-out ${
					isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
				}`}
			>
				<div className="px-6 pb-6">
					<p className="text-muted leading-relaxed">{answer}</p>
				</div>
			</div>
		</div>
	)
}

export default FAQItem

import { useEffect, useRef, useState } from "react"
import { FaMagic, FaPaperPlane, FaRobot } from "react-icons/fa"
import { FaUserDoctor } from "react-icons/fa6"
import { toast } from "react-toastify"

interface Message {
	role: "user" | "ai"
	content: string
}

export default function GenerateAI() {
	const [prompt, setPrompt] = useState("")
	const [messages, setMessages] = useState<Message[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const scrollRef = useRef<HTMLDivElement>(null)

	// Auto-scroll al último mensaje
	useEffect(() => {
		scrollRef.current?.scrollIntoView({ behavior: "smooth" })
	}, [])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!prompt.trim() || isLoading) return

		const userMessage = prompt
		setPrompt("")
		setMessages((prev) => [...prev, { role: "user", content: userMessage }])
		setIsLoading(true)

		try {
			// Aquí iría tu llamada al backend/API de IA
			// const response = await fetchAiResponse(userMessage);

			// Simulación de respuesta de IA
			setTimeout(() => {
				setMessages((prev) => [
					...prev,
					{
						role: "ai",
						content: `Analizando requerimientos para: ${userMessage}. Basado en el protocolo médico actual, recomiendo...`,
					},
				])
				setIsLoading(false)
			}, 1500)
		} catch (error) {
			toast.error("Error al conectar con la IA")
			setIsLoading(false)
			console.log(error)
		}
	}

	return (
		<div className="flex flex-col h-[calc(100vh-120px)] p-4 max-w-5xl mx-auto">
			{/* Header con estilo del proyecto */}
			<div className="flex items-center gap-4 mb-8">
				<div className="p-4 bg-primary/10 rounded-3xl text-primary shadow-sm">
					<FaMagic size={28} />
				</div>
				<div>
					<h1 className="text-3xl font-black text-gray-800 tracking-tight">
						Asistente AI Médico
					</h1>
					<p className="text-gray-500 font-medium">
						Generación de recetas y protocolos inteligentes
					</p>
				</div>
			</div>

			{/* Chat Container */}
			<div className="flex-1 overflow-y-auto mb-6 space-y-6 pr-4 custom-scrollbar">
				{messages.length === 0 && (
					<div className="h-full flex flex-col items-center justify-center text-center opacity-40">
						<FaRobot size={60} className="mb-4 text-primary" />
						<p className="text-xl font-bold">¿En qué puedo ayudarte hoy?</p>
						<p className="text-sm italic">
							"Genera una receta para un paciente con hipertensión..."
						</p>
					</div>
				)}

				{messages.map((msg, index) => (
					<div
						key={msg.content}
						className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
					>
						<div
							className={`flex gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}
						>
							<div
								className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
									msg.role === "user"
										? "bg-primary text-white"
										: "bg-white text-primary border border-gray-100"
								}`}
							>
								{msg.role === "user" ? <FaUserDoctor /> : <FaRobot />}
							</div>
							<div
								className={`p-4 rounded-4xl shadow-sm text-sm leading-relaxed ${
									msg.role === "user"
										? "bg-primary text-white rounded-tr-none"
										: "bg-white text-gray-700 rounded-tl-none border border-gray-50"
								}`}
							>
								{msg.content}
							</div>
						</div>
					</div>
				))}
				{isLoading && (
					<div className="flex justify-start animate-pulse">
						<div className="bg-gray-200 h-10 w-24 rounded-full ml-13"></div>
					</div>
				)}
				<div ref={scrollRef} />
			</div>

			{/* Input Form - Estilo Gemini */}
			<form onSubmit={handleSubmit} className="relative group">
				<div className="absolute inset-0 bg-primary/5 blur-xl rounded-[3rem] group-focus-within:bg-primary/10 transition-all"></div>
				<div className="relative flex items-center bg-white border border-gray-100 shadow-xl rounded-[2.5rem] p-2 transition-all focus-within:border-primary/30">
					<input
						type="text"
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						placeholder="Escribe tu consulta médica aquí..."
						className="flex-1 bg-transparent px-6 py-4 outline-none text-gray-700 font-medium placeholder:text-gray-400"
					/>
					<button
						type="submit"
						disabled={!prompt.trim() || isLoading}
						className={`p-4 rounded-full transition-all flex items-center justify-center ${
							prompt.trim()
								? "bg-primary text-white shadow-lg shadow-primary/30 hover:scale-105 cursor-pointer"
								: "bg-gray-100 text-gray-400 cursor-not-allowed"
						}`}
					>
						<FaPaperPlane
							size={18}
							className={isLoading ? "animate-ping" : ""}
						/>
					</button>
				</div>
			</form>
		</div>
	)
}

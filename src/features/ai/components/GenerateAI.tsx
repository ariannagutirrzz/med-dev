import { useEffect, useRef, useState } from "react"
import { FaMagic, FaPaperPlane, FaRobot } from "react-icons/fa"
import { FaUserDoctor } from "react-icons/fa6"
import { toast } from "react-toastify"
import { Button } from "../../../shared"
import { generateAIResponse } from "../services/AiAPI"

interface Message {
	role: "user" | "assistant"
	content: string
	id: string
}

export default function GenerateAI() {
	const [prompt, setPrompt] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const scrollRef = useRef<HTMLDivElement>(null)

	// 1. Inicializar el estado con lo que haya en localStorage
	const [messages, setMessages] = useState<Message[]>(() => {
		const savedMessages = localStorage.getItem("chat_history")
		return savedMessages ? JSON.parse(savedMessages) : []
	})

	useEffect(() => {
		localStorage.setItem("chat_history", JSON.stringify(messages))
	}, [messages])

	// Auto-scroll optimizado para streaming
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight
		}
	}, [messages, isLoading])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!prompt.trim() || isLoading) return

		const userMessage = prompt
		setPrompt("")

		// 1. Crear y añadir mensaje del usuario
		const userMsg: Message = {
			role: "user",
			content: userMessage,
			id: crypto.randomUUID(),
		}

		// 2. Crear mensaje vacío para la IA que se llenará con el stream
		const aiMsgId = crypto.randomUUID()
		const aiMsg: Message = {
			role: "assistant",
			content: "",
			id: aiMsgId,
		}

		setMessages((prev) => [...prev, userMsg, aiMsg])
		setIsLoading(true)

		try {
			// Pasar historial reciente para contexto (últimos 10 mensajes)
			const recentHistory = messages.slice(-10).map((m) => ({
				role: m.role,
				content: m.content,
			}))
			const textStream = await generateAIResponse(userMessage, recentHistory)

			// 4. Consumir el stream
			for await (const textPart of textStream) {
				setMessages((prev) =>
					prev.map((msg) =>
						msg.id === aiMsgId
							? { ...msg, content: msg.content + textPart }
							: msg,
					),
				)
			}
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Error al generar respuesta de IA"
			const isTimeout =
				error instanceof Error &&
				(error.name === "AbortError" || message.toLowerCase().includes("abort"))
			toast.error(
				isTimeout
					? "El asistente tardó demasiado. Prueba con un mensaje más corto o otro modelo."
					: message,
			)
			console.error(error)
			setMessages((prev) => prev.filter((m) => m.id !== aiMsgId))
		} finally {
			setIsLoading(false)
		}
	}

	return (
		/* Layout principal corregido para ocupar todo el espacio y empujar el input al final */
		<div className="flex flex-col h-full w-full mx-auto p-6">
			{/* 1. Header Fijo */}
			<div className="flex items-center gap-4 mb-4 shrink-0">
				<div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-sm">
					<FaMagic size={22} />
				</div>
				<div>
					<h1 className="text-2xl font-black text-gray-800 tracking-tight">
						Asistente Médico
					</h1>
					<p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
						Protocolos Inteligentes
					</p>
				</div>
			</div>

			{/* 2. Área de Chat (Crece y tiene scroll) */}
			<div
				ref={scrollRef}
				className="flex-1 overflow-y-auto mb-4 space-y-6 pr-2 custom-scrollbar scroll-smooth"
			>
				{messages.length === 0 && (
					<div className="h-full flex flex-col items-center justify-center text-center opacity-30">
						<FaRobot size={50} className="mb-4 text-primary" />
						<p className="text-lg font-bold">¿En que puedo ayudarte hoy?</p>
					</div>
				)}

				{messages.map((msg) =>
					// Ocultamos el mensaje de la IA si está vacío y no está cargando (limpieza visual)
					msg.role === "assistant" &&
					msg.content === "" &&
					!isLoading ? null : (
						<div
							key={msg.id}
							className={`flex ${msg.role === "user" ? "justify-end" : "justify-start animate-in slide-in-from-left-2"}`}
						>
							<div
								className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}
							>
								<div
									className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
										msg.role === "user"
											? "bg-primary text-white"
											: "bg-white text-primary border border-gray-100"
									}`}
								>
									{msg.role === "user" ? (
										<FaUserDoctor size={14} />
									) : (
										<FaRobot size={14} />
									)}
								</div>
								<div
									className={`p-4 rounded-3xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
										msg.role === "user"
											? "bg-primary text-white rounded-tr-none"
											: "bg-white text-gray-700 rounded-tl-none border border-gray-100"
									}`}
								>
									{msg.content}
									{/* Cursor parpadeante mientras escribe */}
									{isLoading &&
										msg.role === "assistant" &&
										msg.content === "" && (
											<span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1" />
										)}
								</div>
							</div>
						</div>
					),
				)}
			</div>

			{/* 3. Input Form - Anclado al final */}
			<div className="shrink-0 pt-2 bg-transparent">
				<form onSubmit={handleSubmit} className="relative group">
					<div className="absolute inset-0 bg-primary/5 blur-xl rounded-[3rem] group-focus-within:bg-primary/10 transition-all"></div>
					<div className="relative flex items-center bg-white border border-gray-200 shadow-2xl rounded-4xl p-1.5 transition-all focus-within:border-primary/40">
						<input
							type="text"
							value={prompt}
							onChange={(e) => setPrompt(e.target.value)}
							placeholder="Ej: Dieta para paciente diabético tipo 2..."
							className="flex-1 bg-transparent px-5 py-3 outline-none text-gray-700 text-sm font-medium"
							disabled={isLoading}
						/>
						<Button
							type="submit"
							disabled={!prompt.trim() || isLoading}
							loading={isLoading}
							icon={<FaPaperPlane size={16} className={isLoading ? "animate-pulse" : ""} />}
							className={`!p-3.5 !rounded-2xl !min-w-0 ${
								prompt.trim() && !isLoading
									? "shadow-lg hover:scale-105"
									: "!bg-gray-100 !text-gray-400 !border-0"
							}`}
						/>
					</div>
				</form>
				<p className="text-[10px] text-center text-gray-400 mt-3 uppercase tracking-widest font-bold">
					Conectado al sistema: inventario, citas y pacientes
				</p>
			</div>
		</div>
	)
}

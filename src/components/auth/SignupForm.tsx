import { useState } from "react"
import Button from "../common/Button"
import InputField from "../common/InputField"

interface SignupFormProps {
	onSignUp: (data: {
		name: string
		email: string
		password: string
		username?: string
	}) => void
}

const SignupForm = ({ onSignUp }: SignupFormProps) => {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [name, setName] = useState("")
	const [username, setUsername] = useState("")

	const handleSubmit = () => {
		onSignUp({ name, email, password, username })
	}

	return (
		<div className="py-6">
			<InputField
				label="Nombre"
				type="text"
				placeholder="Ingresa tu nombre completo"
				value={name}
				onChange={(e) => setName(e.target.value)}
				className="mb-6"
				showIcon={false}
				showSeparator={false}
			/>

			<InputField
				label="Nombre de usuario"
				type="text"
				placeholder="Elige un nombre de usuario"
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				className="mb-6"
				showIcon={false}
				showSeparator={false}
			/>

			<InputField
				label="Correo Electrónico"
				type="email"
				placeholder="correo@ejemplo.com"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				className="mb-6"
				showIcon={false}
				showSeparator={false}
			/>

			<InputField
				label="Contraseña"
				type="password"
				placeholder="Crea una contraseña segura"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				className="mb-3"
				showIcon={false}
				showSeparator={false}
			/>

			<Button text="Registrarse" onClick={handleSubmit} />
		</div>
	)
}

export default SignupForm

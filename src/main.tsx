import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"
import { AuthProvider } from "./features/auth"

const rootElement = document.getElementById("root")

// Explicitly handle the null case
if (!rootElement) {
	throw new Error(
		"Failed to find the root element. Make sure index.html has a <div id='root'></div>",
	)
}

createRoot(rootElement).render(
	<StrictMode>
		<AuthProvider>
			<App />
		</AuthProvider>
	</StrictMode>,
)

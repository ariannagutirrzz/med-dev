import { BrowserRouter, Route, Routes } from "react-router-dom"
import DashboardPage from "./components/DashboardPage"
import ProtectedRoute from "./components/ProtectedRoute"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import MedicosPage from "./pages/MedicosPage"

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/medicos" element={<MedicosPage />} />
				<Route
					path="/dashboard"
					element={
						<ProtectedRoute>
							<DashboardPage />
						</ProtectedRoute>
					}
				/>
			</Routes>
		</BrowserRouter>
	)
}

export default App

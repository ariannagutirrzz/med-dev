import { BrowserRouter, Route, Routes } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import DashboardPage from "./pages/DashboardPage"
import ForgotPasswordPage from "./pages/ForgotPasswordPage"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import MedicosPage from "./pages/MedicosPage"
import ResetPasswordPage from "./pages/ResetPasswordPage"
import VerifyEmailPage from "./pages/VerifyEmailPage"
import { ProtectedRoute } from "./shared"

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/recuperar-contrasena" element={<ForgotPasswordPage />} />
				<Route path="/restablecer-contrasena" element={<ResetPasswordPage />} />
				<Route path="/verificar-correo" element={<VerifyEmailPage />} />
				<Route path="/medicos" element={<MedicosPage />} />
				<Route
					path="/dashboard/*"
					element={
						<ProtectedRoute>
							<DashboardPage />
						</ProtectedRoute>
					}
				/>
			</Routes>
			<ToastContainer />
		</BrowserRouter>
	)
}

export default App

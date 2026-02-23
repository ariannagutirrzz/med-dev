import { jwtDecode } from "jwt-decode"
import { useCallback, useEffect, useRef, useState } from "react"
import { api, getStoredToken, getStoredUser } from "../../../config/axios"
import type { MyTokenPayload } from "../../../shared"
import { Button, PhoneInput } from "../../../shared"
import { parsePhoneToE164 } from "../../../shared/utils/phoneFormat"
import {
	getSettings,
	type UpdateSettingsInput,
	type UserSettings,
	updateSettings as updateUserSettings,
} from "../services/SettingsAPI"
import DoctorAvailabilityManagement from "./DoctorAvailabilityManagement"
import DoctorUnavailabilityManagement from "./DoctorUnavailabilityManagement"

/**
 * Settings Component
 * Following Single Responsibility Principle - handles only settings UI and state
 * Uses SettingsAPI service for data operations (Dependency Inversion)
 */

interface SettingsProps {
	userData: {
		name: string
		role: string
	}
	refreshUser: () => Promise<void>
}

type SettingsSection = "profile" | "notifications" | "security" | "availability"
const Settings: React.FC<SettingsProps> = ({ userData, refreshUser }) => {
	const [activeSection, setActiveSection] = useState<SettingsSection>("profile")
	const [settings, setSettings] = useState<UserSettings | null>(null)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [previewUrl, setPreviewUrl] = useState<string | null>(null)

	// Profile form state
	const [profileData, setProfileData] = useState({
		name: userData.name,
		email: "",
		phone: "",
		role: userData.role,
		image: "",
	})

	// Password form state
	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	})

	const loadSettings = useCallback(async () => {
		try {
			const token = getStoredToken()
			if (!token) {
				setLoading(false)
				return
			}
			setLoading(true)
			const userSettings = await getSettings()
			setSettings(userSettings)
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load settings")
		} finally {
			setLoading(false)
		}
	}, [])

	const loadUserData = useCallback(async () => {
		try {
			const token = getStoredToken()
			if (!token) {
				const storedUser = getStoredUser()
				if (storedUser) {
					const user = JSON.parse(storedUser)
					setProfileData((prev) => ({
						...prev,
						email: user.email || "",
					}))
				}
				return
			}

			const response = await api.get("/users/me")
			if (response.data?.user) {
				const user = response.data.user
				setProfileData((prev) => ({
					...prev,
					email: user.email || "",
					phone: user.phone || "",
					image: user.image || "",
				}))
			}
		} catch {
			const storedUser = getStoredUser()
			if (storedUser) {
				const user = JSON.parse(storedUser)
				setProfileData((prev) => ({
					...prev,
					email: user.email || "",
				}))
			}
		}
	}, [])

	// Load settings and user data on mount
	useEffect(() => {
		loadSettings()
		loadUserData()
	}, [loadSettings, loadUserData])

	const handleUpdateSettings = async (updates: UpdateSettingsInput) => {
		try {
			setSaving(true)
			setError(null)
			setSuccess(null)

			const updatedSettings = await updateUserSettings(updates)
			setSettings(updatedSettings)
			setSuccess("Configuración actualizada exitosamente")
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to update settings")
		} finally {
			setSaving(false)
		}
	}

	const handleUpdateProfile = async () => {
		try {
			setSaving(true)
			setError(null)
			setSuccess(null)

			// Update user profile via user API
			const token = getStoredToken()
			if (!token) {
				throw new Error("Not authenticated")
			}

			// Get user id from JWT token (now uses incremental id)
			const decoded = jwtDecode<MyTokenPayload>(token)
			const userId = decoded.id

			if (!userId) {
				throw new Error("User ID not found in token")
			}

			const formData = new FormData()
			formData.append("name", profileData.name)
			formData.append("phone", parsePhoneToE164(profileData.phone))

			if (selectedFile) {
				formData.append("image", selectedFile)
			}

			const response = await api.patch(`/users/${userId}`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			})

			if (response.data.user?.image) {
				setProfileData((prev) => ({ ...prev, image: response.data.user.image }))
				setPreviewUrl(null)
				setSelectedFile(null)
			}

			await refreshUser()
			setSuccess("Perfil actualizado exitosamente")
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to update profile")
		} finally {
			setSaving(false)
		}
	}

	const handleUpdatePassword = async () => {
		if (passwordData.newPassword !== passwordData.confirmPassword) {
			setError("Las contraseñas no coinciden")
			return
		}

		if (passwordData.newPassword.length < 8) {
			setError("La contraseña debe tener al menos 8 caracteres")
			return
		}

		try {
			setSaving(true)
			setError(null)
			setSuccess(null)

			// Update password via auth API
			await api.patch("/auth/change-password", {
				currentPassword: passwordData.currentPassword,
				newPassword: passwordData.newPassword,
			})

			setSuccess("Contraseña actualizada exitosamente")
			setPasswordData({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			})
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to update password")
		} finally {
			setSaving(false)
		}
	}

	if (loading) {
		return (
			<div className="p-6">
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="text-gray-600">Cargando configuración...</div>
				</div>
			</div>
		)
	}

	return (
		<div className="p-6">
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-gray-800">Configuración</h1>
				<p className="text-gray-600 mt-2">
					Gestiona la configuración del sistema
				</p>
			</div>

			{/* Success/Error Messages */}
			{success && (
				<div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
					{success}
				</div>
			)}
			{error && (
				<div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
					{error}
				</div>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Settings Navigation */}
				<div className="lg:col-span-1">
					<div className="bg-white rounded-2xl shadow-lg p-4">
						<nav className="space-y-2">
							{[
								{ id: "profile", label: "Perfil" },
								{ id: "notifications", label: "Notificaciones" },
								{ id: "security", label: "Seguridad" },
								...(userData.role === "Médico"
									? [{ id: "availability", label: "Disponibilidad" }]
									: []),
								// { id: "preferences", label: "Preferencias" },
							].map((section) => (
								<Button
									key={section.id}
									type="button"
									variant="default"
									onClick={() =>
										setActiveSection(section.id as SettingsSection)
									}
									className={`!w-full !justify-start !h-auto !py-3 ${
										activeSection === section.id
											? "!bg-primary !text-white"
											: "!bg-transparent !text-gray-700 hover:!bg-gray-50 !border-0"
									}`}
								>
									{section.label}
								</Button>
							))}
						</nav>
					</div>
				</div>

				{/* Settings Content */}
				<div className="lg:col-span-2 space-y-6">
					{/* Profile Section */}
					{activeSection === "profile" && (
						<div className="bg-white rounded-2xl shadow-lg p-6">
							<h3 className="text-lg font-semibold text-gray-800 mb-4">
								Información del Perfil
							</h3>
							<div className="space-y-4">
								<div className="flex items-center gap-6 mb-6">
									{/* Visualización de la Imagen */}
									<div className="relative w-24 h-24">
										<div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold overflow-hidden border-2 border-gray-100 shadow-sm">
											{previewUrl || profileData.image ? (
												<img
													src={previewUrl || profileData.image}
													alt="Profile"
													className="w-full h-full object-cover"
												/>
											) : (
												userData.name.charAt(0).toUpperCase()
											)}
										</div>
									</div>

									<div>
										{/* Input Oculto */}
										<input
											type="file"
											ref={fileInputRef}
											className="hidden"
											accept="image/*"
											onChange={(e) => {
												const file = e.target.files?.[0]
												if (file) {
													setSelectedFile(file)
													setPreviewUrl(URL.createObjectURL(file)) // Previsualización local
												}
											}}
										/>
										<Button
											type="button"
											variant="default"
											onClick={() => fileInputRef.current?.click()}
											className="!border-gray-300 hover:!bg-gray-50 !text-sm"
										>
											Cambiar Foto
										</Button>
										{previewUrl && (
											<p className="text-xs text-primary mt-2">
												Nueva imagen seleccionada
											</p>
										)}
									</div>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label
											htmlFor="profile-name"
											className="block text-sm font-medium text-gray-700 mb-2"
										>
											Nombre
										</label>
										<input
											id="profile-name"
											type="text"
											value={profileData.name}
											onChange={(e) =>
												setProfileData({ ...profileData, name: e.target.value })
											}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
										/>
									</div>
									<div>
										<label
											htmlFor="profile-email"
											className="block text-sm font-medium text-gray-700 mb-2"
										>
											Email
										</label>
										<input
											id="profile-email"
											type="email"
											value={profileData.email}
											onChange={(e) =>
												setProfileData({
													...profileData,
													email: e.target.value,
												})
											}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
										/>
									</div>
									<div>
										<label
											htmlFor="profile-phone"
											className="block text-sm font-medium text-gray-700 mb-2"
										>
											Teléfono
										</label>
										<PhoneInput
											id="profile-phone"
											value={profileData.phone}
											onChange={(e164Value) =>
												setProfileData({
													...profileData,
													phone: e164Value,
												})
											}
											placeholder="4XX XXX XXXX"
											className="w-full"
										/>
									</div>
									<div>
										<label
											htmlFor="profile-role"
											className="block text-sm font-medium text-gray-700 mb-2"
										>
											Rol
										</label>
										<input
											id="profile-role"
											type="text"
											value={profileData.role}
											disabled
											className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
										/>
									</div>
								</div>
								<div className="mt-6 flex justify-end">
									<button
										type="button"
										onClick={handleUpdateProfile}
										disabled={saving}
										className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{saving ? "Guardando..." : "Guardar Cambios"}
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Notifications Section */}
					{activeSection === "notifications" && settings && (
						<div className="bg-white rounded-2xl shadow-lg p-6">
							<h3 className="text-lg font-semibold text-gray-800 mb-4">
								Preferencias de Notificaciones
							</h3>
							<div className="space-y-4">
								{[
									{
										key: "email_notifications",
										label: "Notificaciones por Email",
										description: "Recibe notificaciones importantes por correo",
										value: settings.email_notifications,
									},
									{
										key: "appointment_reminders",
										label: "Recordatorios de Citas",
										description:
											"Notificaciones antes de las citas programadas",
										value: settings.appointment_reminders,
									},
									{
										key: "inventory_alerts",
										label: "Alertas de Inventario",
										description: "Notificaciones cuando el stock esté bajo",
										value: settings.inventory_alerts,
									},
								].map((notification) => (
									<div
										key={notification.key}
										className="flex items-center justify-between py-3 border-b border-gray-100"
									>
										<div>
											<p className="font-medium text-gray-800">
												{notification.label}
											</p>
											<p className="text-sm text-gray-600">
												{notification.description}
											</p>
										</div>
										<label className="relative inline-flex items-center cursor-pointer">
											<input
												type="checkbox"
												className="sr-only peer"
												checked={notification.value}
												onChange={(e) =>
													handleUpdateSettings({
														[notification.key]: e.target.checked,
													})
												}
												disabled={saving}
											/>
											<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
										</label>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Security Section */}
					{activeSection === "security" && (
						<div className="bg-white rounded-2xl shadow-lg p-6">
							<h3 className="text-lg font-semibold text-gray-800 mb-4">
								Seguridad
							</h3>
							<div className="space-y-4">
								<div>
									<label
										htmlFor="current-password"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										Contraseña Actual
									</label>
									<input
										id="current-password"
										type="password"
										value={passwordData.currentPassword}
										onChange={(e) =>
											setPasswordData({
												...passwordData,
												currentPassword: e.target.value,
											})
										}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
									/>
								</div>
								<div>
									<label
										htmlFor="new-password"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										Nueva Contraseña
									</label>
									<input
										id="new-password"
										type="password"
										value={passwordData.newPassword}
										onChange={(e) =>
											setPasswordData({
												...passwordData,
												newPassword: e.target.value,
											})
										}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
									/>
								</div>
								<div>
									<label
										htmlFor="confirm-password"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										Confirmar Nueva Contraseña
									</label>
									<input
										id="confirm-password"
										type="password"
										value={passwordData.confirmPassword}
										onChange={(e) =>
											setPasswordData({
												...passwordData,
												confirmPassword: e.target.value,
											})
										}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
									/>
								</div>
								<div className="mt-6 flex justify-end">
									<Button
										type="button"
										variant="primary"
										onClick={handleUpdatePassword}
										disabled={saving}
										loading={saving}
									>
										{saving ? "Actualizando..." : "Actualizar Contraseña"}
									</Button>
								</div>
							</div>
						</div>
					)}

					{/* Availability Section - Only for Doctors */}
					{activeSection === "availability" && userData.role === "Médico" && (
						<div className="space-y-6">
							<div className="bg-white rounded-2xl shadow-lg p-6">
								<DoctorAvailabilityManagement />
							</div>
							<div className="bg-white rounded-2xl shadow-lg p-6">
								<DoctorUnavailabilityManagement />
							</div>
						</div>
					)}

					{/* Preferences Section */}
					{/* {activeSection === "preferences" && settings && (
						<div className="bg-white rounded-2xl shadow-lg p-6">
							<h3 className="text-lg font-semibold text-gray-800 mb-4">
								Preferencias Generales
							</h3>
							<div className="space-y-4">
								<div>
									<label
										htmlFor="language"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										Idioma
									</label>
									<select
										id="language"
										value={settings.language}
										onChange={(e) =>
											handleUpdateSettings({
												language: e.target.value as "es" | "en",
											})
										}
										disabled={saving}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
									>
										<option value="es">Español</option>
										<option value="en">English</option>
									</select>
								</div>
								<div>
									<label
										htmlFor="theme"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										Tema
									</label>
									<select
										id="theme"
										value={settings.theme}
										onChange={(e) =>
											handleUpdateSettings({
												theme: e.target.value as "light" | "dark",
											})
										}
										disabled={saving}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
									>
										<option value="light">Claro</option>
										<option value="dark">Oscuro</option>
									</select>
								</div>
							</div>
						</div>
					)} */}
				</div>
			</div>
		</div>
	)
}

export default Settings

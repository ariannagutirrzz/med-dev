export type Supply = {
	id: string
	name: string
	category: string
	quantity: number
	min_stock: number
	unit: string
	status: string
}

export type Patient = {
	first_name: string
	last_name: string
	email: string
	phone: string
	birthdate: Date // Objeto Date para manejo interno en el calendario/estado
	gender: string
	address: string
	document_id: string
}

// PatientFormData hereda todo de Patient EXCEPTO birthdate, que lo definimos como string
export type PatientFormData = Omit<Patient, "birthdate"> & {
	birthdate: string // Formato YYYY-MM-DD para compatibilidad con la DB
}

export type MedicalHistory = {
	id: number
	patient_id: string
	doctor_id: string
	record_date: Date
	diagnosis: string
	treatment: string
	notes: string
	reason?: string
	background?: string
	physical_exam?: string
	rx_torax?: string | File
	tomografia?: string | File
	created_at: Date
	updated_at: Date
}

export type MedicalHistoryFormData = Omit<
	MedicalHistory,
	"created_at" | "updated_at" | "id"
>

export type MyTokenPayload = {
	id: string
	exp: number
	iat: number
}

export type Appointment = {
	id: number
	patient_id: string
	doctor_id: string
	appointment_date: string // ISO string format
	status: "pending" | "scheduled" | "cancelled" | "completed"
	notes?: string | null
	service_id?: number | null
	price_usd?: number | null
	created_at?: string
	updated_at?: string | null
	// Campos adicionales que vienen del JOIN con users
	patient_name?: string
	doctor_name?: string
}

export type AppointmentFormData = {
	patient_id?: string
	doctor_id?: string
	appointment_date: string // ISO string format: YYYY-MM-DDTHH:mm:ss
	status: "pending" | "scheduled" | "cancelled" | "completed"
	notes?: string | null
	service_id?: number | null
}

export type Surgery = {
	id: number
	patient_id: string
	doctor_id: string
	surgery_date: string // ISO string format
	surgery_type: string
	status: string
	notes?: string | null
	service_id?: number | null
	price_usd?: number | null
	created_at?: string
	updated_at?: string | null
	// Campos adicionales que vienen del JOIN
	patient_first_name?: string
	patient_last_name?: string
	doctor_name?: string
}

export type SurgeryFormData = {
	patient_id: string
	surgery_date: string // ISO string format: YYYY-MM-DDTHH:mm:ss
	surgery_type: string
	status?: string
	notes?: string | null
	service_id?: number | null
}
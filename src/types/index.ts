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
	id: number
	first_name: string
	last_name: string
	email: string
	phone: string
	birthdate: Date
	gender: string
	address: string
	document_id: string
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

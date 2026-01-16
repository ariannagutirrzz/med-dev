export type User = {
	name: string
	email: string
	role: string
	document_id: string
}

const Status = {
	SCHEDULED: "scheduled",
	COMPLETED: "completed",
	CANCELLED: "cancelled",
} as const

export type Status = (typeof Status)[keyof typeof Status]

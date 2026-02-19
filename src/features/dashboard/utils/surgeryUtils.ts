import type { Surgery } from "../../../shared"
import type { Surgery as CalendarSurgery } from "../../../shared/components/Calendar"

/**
 * Utility functions for surgery data transformations
 */

export const mapSurgeryType = (
	surgeryType?: string,
): "Cirugía Mayor" | "Cirugía Menor" | "Cirugía Programada" => {
	if (!surgeryType) return "Cirugía Programada"
	
	if (surgeryType.includes("Mayor") || surgeryType.includes("mayor")) {
		return "Cirugía Mayor"
	}
	if (surgeryType.includes("Menor") || surgeryType.includes("menor")) {
		return "Cirugía Menor"
	}
	return "Cirugía Programada"
}

export const convertSurgeriesToCalendarFormat = (
	surgeries: Surgery[],
): CalendarSurgery[] => {
	return surgeries.map((surgery) => {
		const surgeryDate = new Date(surgery.surgery_date)
		return {
			day: surgeryDate.getDate(),
			month: surgeryDate.getMonth(),
			year: surgeryDate.getFullYear(),
			type: mapSurgeryType(surgery.surgery_type),
		}
	})
}

export const filterSurgeriesByDoctor = (
	surgeries: Surgery[],
	doctorId: string,
): Surgery[] => {
	return surgeries.filter((surgery) => surgery.doctor_id === doctorId)
}

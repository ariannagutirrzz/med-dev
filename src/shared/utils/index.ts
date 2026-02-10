export const calcularEdad = (fechaNacimiento: Date): number => {
	const hoy = new Date()
	let edad = hoy.getFullYear() - fechaNacimiento.getFullYear()
	const mes = hoy.getMonth() - fechaNacimiento.getMonth()

	// Si aún no ha llegado su mes de cumple, o es su mes pero no su día, restamos un año
	if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
		edad--
	}

	return edad
}

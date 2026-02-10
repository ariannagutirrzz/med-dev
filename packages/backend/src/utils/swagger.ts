import type { Options } from "swagger-jsdoc"
import swaggerJSDoc from "swagger-jsdoc"

const options: Options = {
	swaggerDefinition: {
		openapi: "3.0.2",
		tags: [
			{
				name: "Auth",
				description: "Operaciones de la API relacionadas a la autenticación",
			},
			{
				name: "Users",
				description: "Operaciones de la API relacionadas a los usuarios",
			},
			{
				name: "Appointments",
				description: "Operaciones de la API relacionadas a las citas",
			},
			{
				name: "Surgeries",
				description: "Operaciones de la API relacionadas a las cirugías",
			},
			{
				name: "Patients",
				description: "Operaciones de la API relacionadas a los pacientes",
			},
			{
				name: "MedicalRecords",
				description:
					"Operaciones de la API relacionadas a las historias médicas",
			},
			{
				name: "Medical_Supplies",
				description: "Operaciones de la API relacionadas a los insumos médicos",
			},
			{
				name: "Currency",
				description: "Operaciones de la API relacionadas a las tasas de cambio",
			},
		],
		info: {
			title: "Documentacion API MedDev",
			version: "1.0.0",
			description:
				"Documentacion de la API para el sistema de gestion de clinicas MedDev",
		},
	},
	apis: ["./src/routes/*.ts"],
}

const swaggerSpec = swaggerJSDoc(options)
export default swaggerSpec

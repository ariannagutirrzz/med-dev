// Script to add service_id and price columns to appointments and surgeries tables
// Run with: pnpm add-service-columns

import dotenv from "dotenv"
import pg from "pg"

dotenv.config()

const { Pool } = pg

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: process.env.DATABASE_URL?.includes("render.com")
		? { rejectUnauthorized: false }
		: false,
})

async function addServiceColumns() {
	try {
		console.log("Adding service_id and price columns to appointments and surgeries...")

		// Check and add to appointments
		const checkAppointmentsServiceId = await pool.query(`
			SELECT column_name 
			FROM information_schema.columns 
			WHERE table_schema = 'public' 
			AND table_name = 'appointments' 
			AND column_name = 'service_id'
		`)

		if (checkAppointmentsServiceId.rows.length === 0) {
			await pool.query(`
				ALTER TABLE appointments
				ADD COLUMN service_id INTEGER NULL,
				ADD COLUMN price_usd NUMERIC(10,2) NULL,
				ADD CONSTRAINT fk_appointments_service 
					FOREIGN KEY (service_id) REFERENCES doctor_services(id) ON DELETE SET NULL
			`)
			console.log("✅ Added service_id and price_usd to appointments table")
		} else {
			console.log("✅ Columns already exist in appointments table")
		}

		// Check and add to surgeries
		const checkSurgeriesServiceId = await pool.query(`
			SELECT column_name 
			FROM information_schema.columns 
			WHERE table_schema = 'public' 
			AND table_name = 'surgeries' 
			AND column_name = 'service_id'
		`)

		if (checkSurgeriesServiceId.rows.length === 0) {
			await pool.query(`
				ALTER TABLE surgeries
				ADD COLUMN service_id INTEGER NULL,
				ADD COLUMN price_usd NUMERIC(10,2) NULL,
				ADD CONSTRAINT fk_surgeries_service 
					FOREIGN KEY (service_id) REFERENCES doctor_services(id) ON DELETE SET NULL
			`)
			console.log("✅ Added service_id and price_usd to surgeries table")
		} else {
			console.log("✅ Columns already exist in surgeries table")
		}

		await pool.end()
	} catch (error) {
		console.error("❌ Error adding columns:", error.message)
		await pool.end()
		process.exit(1)
	}
}

addServiceColumns()

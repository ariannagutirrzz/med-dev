// Script to create doctor_services table
// Run with: pnpm create-doctor-services-table

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

async function createDoctorServicesTable() {
	try {
		console.log("Creating doctor_services table...")

		// Check if table already exists
		const checkTable = await pool.query(`
			SELECT EXISTS (
				SELECT 1
				FROM information_schema.tables
				WHERE table_schema = 'public'
				AND table_name = 'doctor_services'
			);
		`)

		if (checkTable.rows[0].exists) {
			console.log("✅ Table 'doctor_services' already exists!")
			await pool.end()
			return
		}

		// Create the doctor_services table
		await pool.query(`
			CREATE TABLE doctor_services (
				id SERIAL PRIMARY KEY,
				doctor_id VARCHAR(10) NOT NULL,
				service_type_id INTEGER NOT NULL,
				price_usd NUMERIC(10,2) NOT NULL,
				is_active BOOLEAN NOT NULL DEFAULT TRUE,
				created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP,
				FOREIGN KEY (doctor_id) REFERENCES users(document_id) ON DELETE CASCADE,
				FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE CASCADE,
				UNIQUE(doctor_id, service_type_id)
			)
		`)

		// Create indexes
		await pool.query(`
			CREATE INDEX idx_doctor_services_doctor_id ON doctor_services(doctor_id)
		`)

		await pool.query(`
			CREATE INDEX idx_doctor_services_service_type_id ON doctor_services(service_type_id)
		`)

		await pool.query(`
			CREATE INDEX idx_doctor_services_is_active ON doctor_services(is_active)
		`)

		console.log("✅ Successfully created 'doctor_services' table!")
		console.log("   - Columns: id, doctor_id, service_type_id, price_usd, is_active, created_at, updated_at")
		console.log("   - Indexes: doctor_id, service_type_id, is_active")

		await pool.end()
	} catch (error) {
		console.error("❌ Error creating table:", error.message)
		await pool.end()
		process.exit(1)
	}
}

createDoctorServicesTable()

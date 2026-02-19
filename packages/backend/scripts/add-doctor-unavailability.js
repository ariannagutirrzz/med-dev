// Script to create doctor_unavailability table for date range exceptions
// Run with: pnpm add-doctor-unavailability

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

async function addDoctorUnavailability() {
	try {
		console.log("Creating doctor_unavailability table...")

		// Check if table already exists
		const checkTable = await pool.query(`
			SELECT EXISTS (
				SELECT 1
				FROM information_schema.tables
				WHERE table_schema = 'public'
				AND table_name = 'doctor_unavailability'
			);
		`)

		if (checkTable.rows[0].exists) {
			console.log("✅ Table 'doctor_unavailability' already exists!")
			await pool.end()
			return
		}

		// Create the doctor_unavailability table
		await pool.query(`
			CREATE TABLE doctor_unavailability (
				id SERIAL PRIMARY KEY,
				doctor_id VARCHAR(10) NOT NULL,
				start_date DATE NOT NULL,
				end_date DATE NULL,
				reason TEXT NULL,
				is_active BOOLEAN NOT NULL DEFAULT TRUE,
				created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP,
				FOREIGN KEY (doctor_id) REFERENCES users(document_id) ON DELETE CASCADE,
				CHECK (end_date IS NULL OR end_date >= start_date)
			)
		`)

		// Create indexes
		await pool.query(`
			CREATE INDEX idx_doctor_unavailability_doctor_id ON doctor_unavailability(doctor_id)
		`)

		await pool.query(`
			CREATE INDEX idx_doctor_unavailability_dates ON doctor_unavailability(start_date, end_date)
		`)

		await pool.query(`
			CREATE INDEX idx_doctor_unavailability_is_active ON doctor_unavailability(is_active)
		`)

		console.log("✅ Successfully created 'doctor_unavailability' table!")
		console.log("   - Columns: id, doctor_id, start_date, end_date, reason, is_active, created_at, updated_at")
		console.log("   - Indexes: doctor_id, dates, is_active")

		await pool.end()
	} catch (error) {
		console.error("❌ Error creating table:", error.message)
		await pool.end()
		process.exit(1)
	}
}

addDoctorUnavailability()

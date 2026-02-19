// Script to create doctor_availability table and add blood_type to users table
// Run with: pnpm add-doctor-availability-and-blood-type

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

async function addDoctorAvailabilityAndBloodType() {
	try {
		console.log("Creating doctor_availability table and adding blood_type column...")

		// 1. Create doctor_availability table
		const checkAvailabilityTable = await pool.query(`
			SELECT EXISTS (
				SELECT 1
				FROM information_schema.tables
				WHERE table_schema = 'public'
				AND table_name = 'doctor_availability'
			);
		`)

		if (!checkAvailabilityTable.rows[0].exists) {
			await pool.query(`
				CREATE TABLE doctor_availability (
					id SERIAL PRIMARY KEY,
					doctor_id VARCHAR(10) NOT NULL,
					day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
					start_time TIME NOT NULL,
					end_time TIME NOT NULL,
					is_active BOOLEAN NOT NULL DEFAULT TRUE,
					created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
					updated_at TIMESTAMP,
					FOREIGN KEY (doctor_id) REFERENCES users(document_id) ON DELETE CASCADE,
					CHECK (end_time > start_time)
				)
			`)

			// Create indexes
			await pool.query(`
				CREATE INDEX idx_doctor_availability_doctor_id ON doctor_availability(doctor_id)
			`)

			await pool.query(`
				CREATE INDEX idx_doctor_availability_day_of_week ON doctor_availability(day_of_week)
			`)

			await pool.query(`
				CREATE INDEX idx_doctor_availability_is_active ON doctor_availability(is_active)
			`)

			console.log("✅ Successfully created 'doctor_availability' table!")
		} else {
			console.log("✅ Table 'doctor_availability' already exists!")
		}

		// 2. Add blood_type column to users table
		const checkBloodTypeColumn = await pool.query(`
			SELECT column_name 
			FROM information_schema.columns 
			WHERE table_schema = 'public' 
			AND table_name = 'users' 
			AND column_name = 'blood_type'
		`)

		if (checkBloodTypeColumn.rows.length === 0) {
			await pool.query(`
				ALTER TABLE users
				ADD COLUMN blood_type VARCHAR(10) NULL
			`)
			console.log("✅ Added blood_type column to users table")
		} else {
			console.log("✅ Column blood_type already exists in users table")
		}

		await pool.end()
		console.log("\n✅ Migration completed successfully!")
	} catch (error) {
		console.error("❌ Error running migration:", error.message)
		await pool.end()
		process.exit(1)
	}
}

addDoctorAvailabilityAndBloodType()

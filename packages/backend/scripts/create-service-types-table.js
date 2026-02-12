// Script to create service_types table
// Run with: pnpm create-service-types-table

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

async function createServiceTypesTable() {
	try {
		console.log("Creating service_types table...")

		// Check if table already exists
		const checkTable = await pool.query(`
			SELECT EXISTS (
				SELECT 1
				FROM information_schema.tables
				WHERE table_schema = 'public'
				AND table_name = 'service_types'
			);
		`)

		if (checkTable.rows[0].exists) {
			console.log("✅ Table 'service_types' already exists!")
			await pool.end()
			return
		}

		// Create the service_types table
		await pool.query(`
			CREATE TABLE service_types (
				id SERIAL PRIMARY KEY,
				name VARCHAR(255) NOT NULL UNIQUE,
				description TEXT,
				category VARCHAR(50) NOT NULL DEFAULT 'consultation',
				created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP
			)
		`)

		// Insert default service types
		await pool.query(`
			INSERT INTO service_types (name, description, category) VALUES
			('Consulta', 'Consulta médica general', 'consultation'),
			('Toracoscopia', 'Procedimiento de toracoscopia', 'surgery'),
			('Biopsia de pleura', 'Biopsia de pleura', 'surgery'),
			('Toracoscopia para resección de tú de pulmón', 'Toracoscopia para resección de tú de pulmón', 'surgery'),
			('Ecografía pulmonar', 'Ecografía pulmonar', 'diagnostic')
		`)

		console.log("✅ Successfully created 'service_types' table!")
		console.log("   - Columns: id, name, description, category, created_at, updated_at")
		console.log("   - Default service types inserted")

		await pool.end()
	} catch (error) {
		console.error("❌ Error creating table:", error.message)
		await pool.end()
		process.exit(1)
	}
}

createServiceTypesTable()

// Script to add custom_exchange_rate column to user_settings table
// Run with: pnpm add-custom-exchange-rate

import dotenv from "dotenv"
import pg from "pg"

dotenv.config()

dotenv.config()

const { Pool } = pg

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: process.env.DATABASE_URL?.includes("render.com")
		? { rejectUnauthorized: false }
		: false,
})

async function addCustomExchangeRateColumn() {
	try {
		console.log("Adding custom_exchange_rate column to user_settings table...")

		// Check if column already exists
		const checkColumn = await pool.query(`
			SELECT column_name 
			FROM information_schema.columns 
			WHERE table_schema = 'public' 
			AND table_name = 'user_settings' 
			AND column_name = 'custom_exchange_rate'
		`)

		if (checkColumn.rows.length > 0) {
			console.log("✅ Column 'custom_exchange_rate' already exists!")
			await pool.end()
			return
		}

		// Add the column
		await pool.query(`
			ALTER TABLE user_settings
			ADD COLUMN custom_exchange_rate NUMERIC(12,4) NULL
		`)

		console.log("✅ Successfully added 'custom_exchange_rate' column to user_settings table!")
		console.log("   Column type: NUMERIC(12,4)")
		console.log("   Nullable: YES")

		await pool.end()
	} catch (error) {
		console.error("❌ Error adding column:", error.message)
		await pool.end()
		process.exit(1)
	}
}

addCustomExchangeRateColumn()

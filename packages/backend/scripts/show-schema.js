// Script to show database schema with tables and columns
// Run with: pnpm show-schema

import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: process.env.DATABASE_URL?.includes("render.com")
		? { rejectUnauthorized: false }
		: false,
});

async function showSchema() {
	try {
		console.log("Database Schema:\n");
		console.log("=".repeat(60));

		// Get all tables
		const tablesResult = await pool.query(`
			SELECT table_name 
			FROM information_schema.tables 
			WHERE table_schema = 'public' 
			ORDER BY table_name
		`);

		for (const table of tablesResult.rows) {
			const tableName = table.table_name;
			console.log(`\n📋 Table: ${tableName}`);
			console.log("-".repeat(60));

			// Get columns for this table
			const columnsResult = await pool.query(`
				SELECT 
					column_name,
					data_type,
					character_maximum_length,
					is_nullable,
					column_default
				FROM information_schema.columns
				WHERE table_schema = 'public' 
				AND table_name = $1
				ORDER BY ordinal_position
			`, [tableName]);

			if (columnsResult.rows.length === 0) {
				console.log("  (no columns)");
			} else {
				columnsResult.rows.forEach((col) => {
					const length = col.character_maximum_length
						? `(${col.character_maximum_length})`
						: "";
					const nullable = col.is_nullable === "YES" ? "NULL" : "NOT NULL";
					const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : "";
					console.log(
						`  • ${col.column_name.padEnd(25)} ${col.data_type.toUpperCase()}${length} ${nullable}${defaultVal}`,
					);
				});
			}

			// Get row count
			const countResult = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
			console.log(`  Rows: ${countResult.rows[0].count}`);
		}

		console.log("\n" + "=".repeat(60));
		console.log(`Total tables: ${tablesResult.rows.length}`);

		await pool.end();
	} catch (error) {
		console.error("Error showing schema:", error);
		await pool.end();
		process.exit(1);
	}
}

showSchema();


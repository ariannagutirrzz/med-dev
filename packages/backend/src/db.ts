import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000,
	// Render requires SSL connections
	ssl: process.env.DATABASE_URL?.includes("render.com")
		? { rejectUnauthorized: false }
		: undefined,
});

pool.on("connect", () => {
	console.log("Database connected");
});

pool.on("error", (err: Error) => {
	console.error("Database connection error:", err);
	process.exit(-1);
});

export async function query(text: string, params?: unknown[]) {
	return await pool.query(text, params);
}


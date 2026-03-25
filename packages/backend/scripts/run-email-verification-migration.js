/**
 * Applies email verification schema (no psql required).
 * From packages/backend: pnpm migrate-email-verification
 */
import dotenv from "dotenv"
import pg from "pg"

dotenv.config()

const { Pool } = pg

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: process.env.DATABASE_URL?.includes("render.com")
		? { rejectUnauthorized: false }
		: undefined,
})

async function main() {
	if (!process.env.DATABASE_URL) {
		console.error("DATABASE_URL is not set. Check packages/backend/.env")
		process.exit(1)
	}

	try {
		console.log("Adding users.email_verified…")
		await pool.query(`
			ALTER TABLE users
			ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;
		`)

		console.log("Backfilling email_verified = true for existing users…")
		await pool.query(`UPDATE users SET email_verified = true;`)

		console.log("Creating email_verification_tokens…")
		await pool.query(`
			CREATE TABLE IF NOT EXISTS email_verification_tokens (
				token VARCHAR(64) PRIMARY KEY,
				user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				expires_at TIMESTAMPTZ NOT NULL,
				created_at TIMESTAMPTZ DEFAULT NOW()
			);
		`)

		await pool.query(`
			CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id
				ON email_verification_tokens(user_id);
		`)
		await pool.query(`
			CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at
				ON email_verification_tokens(expires_at);
		`)

		console.log("Done.")
	} catch (err) {
		console.error(err)
		process.exit(1)
	} finally {
		await pool.end()
	}
}

main()

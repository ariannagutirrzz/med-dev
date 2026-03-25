-- Email verification for new users (signup + staff-created patients).
-- Run once (no psql needed on Windows): from packages/backend run: pnpm migrate-email-verification
-- Or: psql $DATABASE_URL -f packages/backend/scripts/init-email-verification.sql

ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;

-- One-time backfill when deploying this feature: trust existing accounts.
-- Do not run this UPDATE again later, or it will verify users who have not clicked the link.
UPDATE users SET email_verified = true;

CREATE TABLE IF NOT EXISTS email_verification_tokens (
	token VARCHAR(64) PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	expires_at TIMESTAMPTZ NOT NULL,
	created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id
	ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at
	ON email_verification_tokens(expires_at);

-- Tabla para tokens de recuperación de contraseña.
-- Ejecutar una vez: psql $DATABASE_URL -f packages/backend/scripts/init-password-reset.sql
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

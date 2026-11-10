-- ============================================================
-- V1: Create users table
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id           VARCHAR(36)  PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name         VARCHAR(100) NOT NULL,
    email        VARCHAR(255) NOT NULL,
    password     VARCHAR(255) NOT NULL,
    role         VARCHAR(20)  NOT NULL DEFAULT 'USER',
    department   VARCHAR(100),
    phone        VARCHAR(30),
    location     VARCHAR(150),
    company      VARCHAR(150),
    bio          TEXT,
    avatar_url   VARCHAR(500),
    active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_role CHECK (role IN ('USER','ADMIN','MANAGER'))
);

CREATE INDEX IF NOT EXISTS idx_users_email  ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users (active);

COMMENT ON TABLE  users              IS 'Platform user accounts';
COMMENT ON COLUMN users.role         IS 'USER | ADMIN | MANAGER';
COMMENT ON COLUMN users.active       IS 'False = soft-deleted / disabled';

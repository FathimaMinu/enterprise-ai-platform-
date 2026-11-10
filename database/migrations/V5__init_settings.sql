-- ============================================================
-- V5: Create settings table (one row per user)
-- ============================================================

CREATE TABLE IF NOT EXISTS settings (
    id                   VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id              VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- General
    company_name         VARCHAR(150) DEFAULT 'My Company',
    timezone             VARCHAR(60)  DEFAULT 'America/New_York',
    language             VARCHAR(10)  DEFAULT 'en',
    date_format          VARCHAR(20)  DEFAULT 'MM/DD/YYYY',

    -- Security
    two_factor_enabled   BOOLEAN     NOT NULL DEFAULT FALSE,
    session_timeout      INTEGER     NOT NULL DEFAULT 30,
    password_expiry      INTEGER     NOT NULL DEFAULT 90,
    ip_whitelist         BOOLEAN     NOT NULL DEFAULT FALSE,

    -- Notifications
    email_alerts         BOOLEAN     NOT NULL DEFAULT TRUE,
    push_notifications   BOOLEAN     NOT NULL DEFAULT TRUE,
    weekly_digest        BOOLEAN     NOT NULL DEFAULT TRUE,
    query_alerts         BOOLEAN     NOT NULL DEFAULT FALSE,
    security_alerts      BOOLEAN     NOT NULL DEFAULT TRUE,

    created_at           TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP   NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_settings_user UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_settings_user_id ON settings (user_id);

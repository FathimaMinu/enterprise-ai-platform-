-- ============================================================
-- V3: Create chat_messages table
-- ============================================================

CREATE TABLE IF NOT EXISTS chat_messages (
    id          VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id     VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    message     TEXT        NOT NULL,
    response    TEXT,
    created_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_user_id    ON chat_messages (user_id);
CREATE INDEX IF NOT EXISTS idx_chat_created_at ON chat_messages (created_at DESC);

COMMENT ON TABLE chat_messages IS 'AI chat conversation history per user';

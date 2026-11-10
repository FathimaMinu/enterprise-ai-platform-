-- ============================================================
-- V4: Create knowledge_base table
-- ============================================================

CREATE TABLE IF NOT EXISTS knowledge_base (
    id          VARCHAR(36)  PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title       VARCHAR(255) NOT NULL,
    content     TEXT         NOT NULL,
    category    VARCHAR(50)  NOT NULL DEFAULT 'General',
    author_id   VARCHAR(36)  REFERENCES users(id) ON DELETE SET NULL,
    views       INTEGER      NOT NULL DEFAULT 0,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_kb_category CHECK (
        category IN ('HR','IT','Finance','General','Operations','Legal','Marketing')
    )
);

CREATE INDEX IF NOT EXISTS idx_kb_category   ON knowledge_base (category);
CREATE INDEX IF NOT EXISTS idx_kb_author     ON knowledge_base (author_id);
CREATE INDEX IF NOT EXISTS idx_kb_updated_at ON knowledge_base (updated_at DESC);

COMMENT ON TABLE knowledge_base IS 'Enterprise knowledge articles';

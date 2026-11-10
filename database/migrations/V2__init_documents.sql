-- ============================================================
-- V2: Create documents table
-- ============================================================

CREATE TABLE IF NOT EXISTS documents (
    id          VARCHAR(36)  PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name        VARCHAR(255) NOT NULL,
    type        VARCHAR(100),
    size        BIGINT,
    url         VARCHAR(500),
    user_id     VARCHAR(36)  REFERENCES users(id) ON DELETE SET NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'processing',
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_documents_status CHECK (status IN ('processing','processed','failed'))
);

CREATE INDEX IF NOT EXISTS idx_documents_user_id    ON documents (user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status     ON documents (status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents (created_at DESC);

COMMENT ON TABLE  documents         IS 'Uploaded enterprise documents';
COMMENT ON COLUMN documents.status  IS 'processing | processed | failed';
COMMENT ON COLUMN documents.url     IS 'Relative path: /uploads/<uuid>_<filename>';

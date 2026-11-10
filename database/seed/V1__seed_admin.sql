-- ============================================================
-- Seed: Default admin user
-- Password: admin123  (BCrypt hash — change immediately in prod)
-- ============================================================

INSERT INTO users (id, name, email, password, role, department, company, active)
VALUES (
    'admin-00000000-0000-0000-0000-000000000001',
    'Platform Admin',
    'admin@enterprise.ai',
    '$2a$12$6DZFLAmNi8ZeUdkmU8S5LeRJmHi6s8VaWUKftyZ5X3RMNl/e8Gl5m',
    'ADMIN',
    'Technology',
    'Enterprise AI',
    TRUE
)
ON CONFLICT (email) DO NOTHING;

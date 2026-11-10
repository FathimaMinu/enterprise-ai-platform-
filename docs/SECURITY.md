# Security Guide — Enterprise AI Platform

## Authentication Flow

```
Client                 Spring Boot              JWT
  │                        │
  │── POST /api/auth/login ─►│
  │   {email, password}     │── BCrypt.verify() ──►  match?
  │                        │                          │
  │                        │◄── generateToken() ──────┘
  │◄── {token, userId...} ──│   (HS256, 24h expiry)
  │
  │── GET /api/profile ────►│
  │   Authorization:        │── JwtAuthFilter ─► validateToken()
  │   Bearer <token>        │── extractEmail() ─► loadUserByEmail()
  │                        │── SecurityContext.setAuthentication()
  │◄── {user profile} ──────│
```

## JWT Configuration

| Property | Value | Notes |
|---|---|---|
| Algorithm | HS256 | HMAC-SHA256 |
| Expiry | 24 hours (86400000 ms) | Configured via `jwt.expiration` |
| Secret | `${JWT_SECRET}` env var | **Never hardcode — minimum 64 chars** |
| Storage (client) | `localStorage` key `eai_token` | Token only — no user object |

### Generating a secure JWT secret

```bash
# Option 1: OpenSSL
openssl rand -base64 64

# Option 2: Python
python -c "import secrets, base64; print(base64.b64encode(secrets.token_bytes(64)).decode())"
```

## Password Security

- Hashed with BCrypt (strength 10 — default Spring Security)
- Minimum 8 characters enforced at DTO validation layer (`@Size(min=8)`)
- Never stored or returned in plain text
- Change-password endpoint requires current password verification

## CORS

Allowed origins are configured via `${CORS_ALLOWED_ORIGINS}` env var.

```
# Dev
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174

# Prod (comma-separated)
CORS_ALLOWED_ORIGINS=https://your-app.com
```

## H2 Console

- **Enabled only in `dev` profile** (`spring.h2.console.enabled=true`)
- Disabled in `prod` profile
- Never expose H2 console in any internet-facing deployment

## Secrets Management

| Secret | Env Var | Required |
|---|---|---|
| JWT signing key | `JWT_SECRET` | Yes — no default in prod |
| OpenAI API key | `OPENAI_API_KEY` | No — AI features disabled without it |
| DB password | `SPRING_DATASOURCE_PASSWORD` | Yes in prod |

**Local dev only**: `application-dev.properties` contains a fallback `jwt.secret`
for convenience. This value must never be used in any shared environment.

## File Upload Security

- Allowed MIME types: `application/pdf`, `application/vnd.openxmlformats...docx`,
  `application/vnd.openxmlformats...xlsx`, `text/plain`, `image/png`, `image/jpeg`
- Maximum file size: 50 MB
- Files stored with UUID prefix to prevent path traversal
- File content type validated server-side (not just extension)

## Input Validation

All `@RequestBody` parameters are validated with Jakarta Bean Validation:
- `@NotBlank` on all required strings
- `@Email` on email fields
- `@Size(min=8)` on passwords
- Validation failures return 400 with per-field error messages (never stack traces)

## Security Checklist Before Production

- [ ] `JWT_SECRET` set to 64+ char random string
- [ ] `SPRING_PROFILES_ACTIVE=prod`
- [ ] H2 console is disabled
- [ ] `CORS_ALLOWED_ORIGINS` set to your actual domain
- [ ] PostgreSQL password is strong and unique
- [ ] `.env` file is in `.gitignore` (not committed)
- [ ] `logging.level.org.springframework.security` is `WARN` (not `DEBUG`)
- [ ] `server.error.include-stacktrace=never` (set in `application-prod.properties`)

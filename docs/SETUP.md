# Local Development Setup

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Java JDK | 17+ | https://adoptium.net |
| Maven | 3.9+ | bundled with JDK or https://maven.apache.org |
| Node.js | 20+ | https://nodejs.org |
| Python | 3.11+ | https://python.org |
| Git | any | https://git-scm.com |
| Docker + Compose | 24+ | https://docker.com (optional) |

---

## Quick Start (3 terminals)

### Terminal 1 — Spring Boot Backend

```bash
cd backend

# First run: set environment variable (Windows PowerShell)
$env:JWT_SECRET = "dev-local-only-secret-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Or on Mac/Linux:
export JWT_SECRET="dev-local-only-secret-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Backend starts at **http://localhost:8080**  
H2 Console: http://localhost:8080/h2-console (JDBC URL: `jdbc:h2:mem:enterpriseai`)

### Terminal 2 — Python AI Service (optional)

```bash
cd backend/app

# Create virtual environment
python -m venv venv
source venv/bin/activate       # Mac/Linux
.\venv\Scripts\Activate.ps1    # Windows PowerShell

# Install dependencies
pip install -r requirements.txt

# Set OpenAI key (optional — AI works without it using fallback responses)
export OPENAI_API_KEY="sk-..."   # Mac/Linux
$env:OPENAI_API_KEY="sk-..."     # Windows

# Start
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

AI service starts at **http://localhost:8000**

### Terminal 3 — React Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at **http://localhost:5173**

---

## Default Credentials

| Role | Email | Password |
|---|---|---|
| Demo user | `admin@enterprise.ai` | `admin123` |

The demo user is seeded via `database/seed/V1__seed_admin.sql` (runs in prod with Flyway).  
In dev, register a new account via the UI — Hibernate auto-creates the schema.

---

## Running Tests

### Java tests

```bash
cd backend
mvn test "-Dspring.profiles.active=test"
```

### Frontend tests

```bash
cd frontend
npm install          # first time only
npm test             # single run
npm run test:watch   # watch mode
```

---

## Environment Variables Reference

Copy `.env.example` to `.env` at the project root and fill in values:

```bash
cp .env.example .env
```

| Variable | Required | Default (dev) | Description |
|---|---|---|---|
| `JWT_SECRET` | Yes | dev fallback | HS256 signing key (64+ chars) |
| `OPENAI_API_KEY` | No | empty | Enables real AI responses |
| `SPRING_DATASOURCE_URL` | Prod only | H2 in-memory | PostgreSQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | Prod only | — | DB username |
| `SPRING_DATASOURCE_PASSWORD` | Prod only | — | DB password |
| `CORS_ALLOWED_ORIGINS` | No | localhost:5173 | Comma-separated frontend origins |
| `VITE_API_URL` | No | localhost:8080/api | Backend URL for React |
| `AI_SERVICE_URL` | No | localhost:8000 | Python AI service URL |

---

## Docker Compose (All Services)

```bash
# 1. Copy and fill in .env
cp .env.example .env

# 2. Start everything
cd docker
docker-compose up --build

# Services:
#   Frontend  → http://localhost:3000
#   Backend   → http://localhost:8080
#   AI        → http://localhost:8000
#   PostgreSQL → localhost:5432
```

---

## Common Issues

| Problem | Cause | Fix |
|---|---|---|
| Backend fails to start | `JWT_SECRET` not set | Set `JWT_SECRET` env var (see above) |
| 401 on all API calls | Expired or missing token | Log out and log in again |
| AI returns fallback | No `OPENAI_API_KEY` | Set the env var or leave empty for mock responses |
| H2 console blank | Wrong JDBC URL | Use `jdbc:h2:mem:enterpriseai` exactly |
| Frontend 404 on refresh | Nginx not configured | Use `npm run dev` locally (Vite handles SPA routing) |

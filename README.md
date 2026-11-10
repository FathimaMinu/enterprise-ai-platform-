# Enterprise AI Platform

A full-stack, production-ready AI-powered enterprise knowledge management platform.
Upload company documents, ask questions in natural language, and get grounded answers
from your own data — powered by RAG (Retrieval-Augmented Generation).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 8 + React Router v7 |
| Backend | Spring Boot 3.2.5 + Java 17 + JWT |
| AI Service | Python 3.11 + FastAPI + LangChain + ChromaDB |
| Database (dev) | H2 in-memory |
| Database (prod) | PostgreSQL 16 + Flyway migrations |
| Auth | HS256 JWT (24h expiry) + BCrypt passwords |
| Tests | JUnit 5 + Mockito + Spring Boot Test / Vitest + RTL |
| DevOps | GitHub Actions CI/CD → Vercel (FE) + Render (BE) |
| Containers | Docker + Docker Compose |

---

## Features

- **AI Chat** — natural language Q&A over your company documents (RAG)
- **Document Management** — upload PDF, DOCX, XLSX, TXT; AI auto-indexes
- **Knowledge Base** — structured articles with HR/IT/Finance/General categories
- **Analytics Dashboard** — query trends, department usage, cost savings
- **Settings** — notifications, security (2FA, session timeout), integrations
- **Profile** — avatar, personal info, password change
- **JWT Auth** — stateless, token-only sessions, protected routes

---

## Quick Start (< 10 minutes)

### 1. Clone and configure

```bash
git clone <your-repo-url>
cd enterprise-ai-platform
cp .env.example .env
# Edit .env — set JWT_SECRET at minimum
```

### 2. Start the backend (Terminal 1)

```bash
cd backend

# Windows PowerShell
$env:JWT_SECRET = "your-64-char-secret-here"
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Mac/Linux
JWT_SECRET="your-64-char-secret-here" mvn spring-boot:run -Dspring-boot.run.profiles=dev
```
→ **http://localhost:8080** | H2 Console: http://localhost:8080/h2-console

### 3. Start the AI service (Terminal 2 — optional)

```bash
cd backend/app
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
→ **http://localhost:8000** | Docs: http://localhost:8000/docs

### 4. Start the frontend (Terminal 3)

```bash
cd frontend
npm install
npm run dev
```
→ **http://localhost:5173**

### 5. Login

| Field | Value |
|---|---|
| Email | `admin@enterprise.ai` |
| Password | `admin123` |

Or register a new account at `/register`.

---

## Run with Docker Compose

```bash
cp .env.example .env     # fill JWT_SECRET + DB password
cd docker
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| AI Service | http://localhost:8000 |
| PostgreSQL | localhost:5432 |

---

## Run Tests

```bash
# Java (backend)
cd backend
mvn test "-Dspring.profiles.active=test"
# 17 tests: AuthController (6) + JwtUtil (7) + DocumentService (4)

# Frontend
cd frontend
npm install
npm test
```

---

## Project Structure

```
enterprise-ai-platform/
├── frontend/              React 19 + Vite
│   └── src/
│       ├── pages/         All 10 pages (wired to real API)
│       ├── components/    Layout, ErrorBoundary, ProtectedRoute, Toggle
│       ├── context/       AuthContext (JWT token management)
│       └── services/      api.js (typed Axios client)
├── backend/
│   ├── src/main/java/     Spring Boot application
│   │   └── com/enterpriseai/backend/
│   │       ├── controller/   REST endpoints (8 controllers)
│   │       ├── service/      Business logic (8 services)
│   │       ├── security/     JWT filter + utilities
│   │       ├── entity/       JPA entities (5)
│   │       ├── repository/   Spring Data repositories
│   │       └── dto/          Request/response DTOs (10)
│   ├── src/test/          17 passing tests
│   ├── app/               Python AI microservice
│   │   ├── main.py        FastAPI application
│   │   ├── rag_pipeline.py RAG orchestration
│   │   ├── vector_store.py ChromaDB wrapper
│   │   ├── llm_client.py  OpenAI client
│   │   ├── embeddings.py  Chunking + embedding
│   │   └── document_parser.py PDF/DOCX/TXT parser
│   └── src/main/resources/
│       └── db/migration/  Flyway V1–V5 SQL migrations
├── database/              Source SQL migrations
├── docker/                Dockerfiles + docker-compose.yml
├── docs/                  ARCHITECTURE.md API.md SETUP.md SECURITY.md
└── .github/workflows/     CI/CD pipeline
```

---

## Documentation

| Doc | Description |
|---|---|
| [SETUP.md](docs/SETUP.md) | Detailed local dev setup |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System diagram + data flows |
| [API.md](docs/API.md) | Full API endpoint reference |
| [SECURITY.md](docs/SECURITY.md) | JWT flow, secrets, checklist |

---

## CI/CD

GitHub Actions pipeline (`.github/workflows/deploy.yml`):
- **Build**: Maven + npm build on every push/PR
- **Test**: `mvn test` + `npm run build`
- **Deploy** (main/master only): Backend → Render, Frontend → Vercel

Required secrets: `JWT_SECRET`, `RENDER_API_KEY`, `BACKEND_SERVICE_ID`,
`VERCEL_TOKEN`, `ORG_ID`, `PROJECT_ID`

---

## License

MIT © Enterprise AI Platform Team

# System Architecture — Enterprise AI Platform

## Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BROWSER (React 19)                          │
│   Landing · Login · Register · Dashboard · Knowledge Base           │
│   Documents · AI Chat · Analytics · Settings · Profile              │
└──────────────────────────┬──────────────────────────────────────────┘
                           │  HTTPS / REST (JWT Bearer token)
                           │  VITE_API_URL = http://localhost:8080/api
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│               SPRING BOOT 3.2.5  (Java 17)  :8080                  │
│                                                                     │
│  ┌──────────────┐  ┌───────────────┐  ┌───────────────────────┐   │
│  │  Controllers │  │   Services    │  │   Security Layer       │   │
│  │  /api/auth   │  │  AuthService  │  │  JwtAuthFilter         │   │
│  │  /api/chat   │  │  UserService  │  │  JwtUtil               │   │
│  │  /api/docs   │  │  ChatService  │  │  CustomUserDetails     │   │
│  │  /api/kb     │  │  DocService   │  │  SecurityConfig        │   │
│  │  /api/dash   │  │  KbService    │  └───────────────────────┘   │
│  │  /api/analytics│ │  SettingsService│                            │
│  │  /api/profile│  │  DashboardSvc │                              │
│  │  /api/settings│  └───────────────┘                              │
│  └──────────────┘                                                   │
│           │                        │                                │
│           ▼                        ▼                                │
│  ┌────────────────┐    ┌──────────────────────┐                    │
│  │  H2 (dev) /    │    │  RestTemplate call   │                    │
│  │  PostgreSQL    │    │  to AI service       │                    │
│  │  (prod)        │    │  ${AI_SERVICE_URL}   │                    │
│  │                │    └──────────┬───────────┘                    │
│  │  users         │               │                                │
│  │  documents     │               │  HTTP POST /api/ai/query       │
│  │  chat_messages │               │  HTTP POST /api/ai/index       │
│  │  knowledge_base│               ▼                                │
│  │  settings      │   ┌────────────────────────────────────┐       │
│  └────────────────┘   │   PYTHON FASTAPI  :8000             │       │
│                       │                                    │       │
│                       │  RagPipeline                       │       │
│                       │   ├─ document_parser (PDF/DOCX/TXT)│       │
│                       │   ├─ embeddings (OpenAI / zero-vec)│       │
│                       │   ├─ vector_store (ChromaDB)       │       │
│                       │   └─ llm_client  (GPT-4o-mini)     │       │
│                       │                                    │       │
│                       │  ChromaDB (./chroma_db persisted)  │       │
│                       └────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

### React Frontend
- Single-page application, React Router v7
- `AuthContext` — JWT token management, profile hydration on mount
- `api.js` — typed Axios client, request/response interceptors
- `ErrorBoundary` — catches render crashes, shows reload UI
- `ProtectedRoute` — redirects unauthenticated users to `/login`

### Spring Boot Backend
- Stateless REST API, JWT-secured
- `JwtAuthFilter` — validates Bearer token on every request except public routes
- `GlobalExceptionHandler` — maps all exceptions to `ApiError` JSON
- Service layer holds all business logic (controllers are thin)
- Flyway manages schema in production; Hibernate DDL used in dev

### Python AI Service
- FastAPI microservice called by Spring Boot via RestTemplate
- `RagPipeline` orchestrates: parse → chunk → embed → store → retrieve → generate
- ChromaDB stores vector embeddings persistently on disk
- OpenAI GPT-4o-mini generates grounded answers from retrieved chunks
- Falls back to context preview if no API key is configured

### Database
| Environment | Engine | Migration |
|---|---|---|
| dev / test | H2 in-memory | `ddl-auto=update` (Hibernate) |
| prod | PostgreSQL 16 | Flyway V1–V5 migrations |

## Data Flow: User asks AI a question

```
1. User types in Chat.jsx
2. POST /api/chat/message { message: "..." } → Spring Boot
3. ChatService.sendMessage() → POST http://ai:8000/api/ai/query
4. RagPipeline.query():
   a. get_embeddings([question])   → OpenAI embeddings API
   b. vector_store.search()        → ChromaDB cosine similarity
   c. llm_client.generate_answer() → OpenAI GPT-4o-mini
5. Answer returned up the chain → saved to chat_messages table
6. Response displayed in Chat.jsx bubble
```

## Data Flow: Document uploaded

```
1. User drops file in Documents.jsx
2. POST /api/documents/upload (multipart) → Spring Boot
3. DocumentService:
   a. validateFile() — MIME type + size check
   b. File saved to /uploads/<uuid>_filename
   c. Document entity saved to DB (status=processing)
   d. POST http://ai:8000/api/ai/index { document_id, file_path }
4. RagPipeline.index_document():
   a. parse_file()  — extract text
   b. chunk_text()  — 500-word chunks with 50-word overlap
   c. get_embeddings() — embed all chunks
   d. add_documents() — upsert to ChromaDB
5. Document status updated to "indexed"
```

## Deployment Architecture (Docker Compose)

```
Internet
    │
    ▼
 Nginx :80/:443        ← frontend container (React build)
    │
    ├─► /api/**  ──────► Spring Boot :8080  ← backend container
    │                        │
    │                        ├──► PostgreSQL :5432  ← db container
    │                        │
    │                        └──► Python AI :8000   ← ai container
    │                                  │
    │                               ChromaDB (volume)
    │
    └─► /*       ──────► index.html  (SPA fallback)
```

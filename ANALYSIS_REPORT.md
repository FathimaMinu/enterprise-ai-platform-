# Enterprise AI Platform — Full Codebase Analysis Report

**Generated:** July 2026  
**Analyst:** Kiro (automated deep-read of all project files)  
**Basis:** Every file in the repository was read before writing any finding.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Codebase Analysis](#2-codebase-analysis)
3. [Functional Analysis](#3-functional-analysis)
4. [Quality & Security Review](#4-quality--security-review)
5. [DevOps & Deployment](#5-devops--deployment)
6. [Risks & Recommendations](#6-risks--recommendations)
7. [Summary Report](#7-summary-report)

---

## 1. Project Overview

### 1.1 Project Identity

| Field | Value |
|---|---|
| **Full Name** | Enterprise AI Platform |
| **Frontend Version** | `0.0.0` (`frontend/package.json`) |
| **Backend Version** | `0.0.1-SNAPSHOT` (`backend/pom.xml`) |
| **Python AI Layer Version** | Unnamed stub (2 endpoints only) |
| **Build Date** | Active development |

### 1.2 Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend framework | React | 19.2.6 |
| Frontend build tool | Vite | 8.0.12 |
| Frontend routing | react-router-dom | 7.1.1 |
| Frontend charts | Recharts | 3.8.1 |
| Frontend icons | react-icons | 5.6.0 |
| Frontend HTTP client | axios | 1.17.0 |
| Backend framework | Spring Boot | 3.2.5 |
| Backend language | Java | 17 |
| Backend DB (dev) | H2 (in-memory) | bundled |
| Backend auth library | jjwt | 0.11.5 |
| Backend utility | Lombok | bundled |
| AI microservice | FastAPI (Python) | stub only |
| CI/CD | GitHub Actions | — |
| Deployment targets | Vercel (FE), Render (BE) | — |

### 1.3 Purpose & Business Goal

The platform aims to be an **AI-powered enterprise knowledge management system** — allowing organizations to upload documents, query them through an AI chat interface, manage a structured knowledge base, and monitor usage through analytics. The long-term goal is Retrieval-Augmented Generation (RAG) where the AI answers questions based on company-uploaded documents.

### 1.4 Target Users

- **Enterprise employees** — query HR, IT, Finance policies via AI chat
- **HR / IT / Finance managers** — manage the knowledge base and document library
- **System administrators** — configure integrations, security, and notifications

### 1.5 Key Modules

| Module | Description |
|---|---|
| **Landing** | Public marketing page with video hero, features, pricing, contact |
| **Auth** | Login and register with form validation and localStorage sessions |
| **Dashboard** | Stat cards, activity feed, mini AI chat widget |
| **Knowledge Base** | CRUD articles with category filters and search |
| **Documents** | File upload, management, status tracking |
| **AI Chat** | Conversation interface with history and typing indicator |
| **Analytics** | Recharts visualizations, department breakdown, activity table |
| **Settings** | General / Security / Notifications / Integrations tabs |
| **Profile** | Avatar, personal info, password change, 2FA toggle |

### 1.6 High-Level Architecture

```
Browser (React 19)
      │
      │  All pages currently use mockApi.js (no live HTTP calls to backend)
      │  api.js exists but is never imported by any page component
      │
      ▼
frontend/src/services/mockApi.js   ←── All UI data comes from here (static)
      │
      │  (DISCONNECTED — no fetch/axios calls wired to any page)
      │
      ▼
Spring Boot :8080                  ←── Runs independently, unused by UI
  ├─ /api/auth (register, login)
  ├─ /api/chat (messages, send)
  ├─ /api/documents (list, upload)
  ├─ /api/dashboard (stats)
  └─ /api/test (health)
      │
      │  (DISCONNECTED — no calls from Spring Boot to Python)
      ▼
Python FastAPI :?                  ←── 2-line stub, no port configured, never called
```

> **Critical finding:** The three tiers are completely disconnected. The frontend uses only static mock data. The Spring Boot backend runs but is never called by the UI. The Python AI service is a 4-line stub with no business logic.

### 1.7 Repository Structure

```
enterprise-ai-platform/
├── .github/
│   └── workflows/
│       └── deploy.yml              ← CI/CD pipeline
├── backend/
│   ├── app/
│   │   └── main.py                 ← Python FastAPI stub (2 routes)
│   ├── src/main/java/com/enterpriseai/backend/
│   │   ├── BackendApplication.java
│   │   ├── config/
│   │   │   └── SecurityConfig.java
│   │   ├── controller/
│   │   │   ├── AuthController.java
│   │   │   ├── ChatController.java
│   │   │   ├── DashboardController.java
│   │   │   ├── DocumentController.java
│   │   │   └── TestController.java
│   │   ├── dto/                    ← EMPTY
│   │   ├── entity/
│   │   │   ├── ChatMessage.java
│   │   │   ├── Document.java
│   │   │   └── User.java
│   │   ├── repository/
│   │   │   ├── ChatMessageRepository.java
│   │   │   ├── DocumentRepository.java
│   │   │   └── UserRepository.java
│   │   ├── security/               ← EMPTY
│   │   └── service/                ← EMPTY
│   ├── uploads/                    ← 5 real PDF files stored here
│   ├── pom.xml
│   └── src/main/resources/
│       └── application.properties
├── database/                       ← EMPTY
├── docker/                         ← EMPTY
├── docs/                           ← EMPTY
├── frontend/
│   ├── public/
│   │   ├── AI image.png
│   │   ├── ai-bg.svg
│   │   ├── favicon.svg
│   │   ├── icons.svg
│   │   ├── office-team.jpg
│   │   └── Videos/hero-bg.mp4
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   ├── main.jsx
│   │   ├── components/
│   │   │   └── Layout.jsx          ← Sidebar + header shell
│   │   ├── context/
│   │   │   └── AuthContext.jsx     ← localStorage-based auth state
│   │   ├── pages/
│   │   │   ├── Analytics.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Documents.jsx
│   │   │   ├── KnowledgeBase.jsx
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── NotFound.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/
│   │   │   ├── api.js              ← Axios client (UNUSED by any page)
│   │   │   └── mockApi.js          ← All mock data (used by all pages)
│   │   └── styles/
│   │       ├── landing.css
│   │       ├── login.css
│   │       └── register.css
│   ├── index.html
│   └── package.json
├── build.bat                       ← Windows build script
└── README.md
```

---

## 2. Codebase Analysis

### 2.1 Frontend — Dependency Inventory

**`frontend/package.json` — Production dependencies:**

| Package | Version | Usage |
|---|---|---|
| `react` | ^19.2.6 | UI framework |
| `react-dom` | ^19.2.6 | DOM rendering |
| `react-router-dom` | ^7.1.1 | Client-side routing |
| `recharts` | ^3.8.1 | Analytics charts (BarChart, LineChart) |
| `react-icons` | ^5.6.0 | Icons (FaXxx, FiXxx mixed) |
| `axios` | ^1.17.0 | HTTP client — **imported in api.js but api.js is never imported by any page** |

**`frontend/package.json` — Dev dependencies:**

| Package | Version | Purpose |
|---|---|---|
| `vite` | ^8.0.12 | Build + dev server |
| `@vitejs/plugin-react` | ^6.0.1 | Vite React support |
| `eslint` | ^10.3.0 | Linting |
| `eslint-plugin-react-hooks` | ^7.1.1 | Hooks rules |
| `eslint-plugin-react-refresh` | ^0.5.2 | HMR linting |
| `@types/react` | ^19.2.14 | TypeScript types (unused — no TS) |
| `@types/react-dom` | ^19.2.3 | TypeScript types (unused — no TS) |

> **Note:** `@types/react` and `@types/react-dom` are devDependencies in a JavaScript (not TypeScript) project. They are unused overhead.

**Root `package.json`:**
```json
{ "dependencies": { "lucide-react": "^1.21.0" } }
```
> `lucide-react` is declared at the root level but no component in the project imports it. This is dead dependency.

### 2.2 Backend — Dependency Inventory

**`backend/pom.xml` — Spring Boot 3.2.5, Java 17:**

| Dependency | Version | Used? |
|---|---|---|
| `spring-boot-starter-web` | 3.2.5 | ✅ Yes |
| `spring-boot-starter-data-jpa` | 3.2.5 | ✅ Yes |
| `spring-boot-starter-security` | 3.2.5 | ⚠️ Configured but all routes are `.permitAll()` |
| `spring-boot-starter-validation` | 3.2.5 | ❌ Declared, never used (no `@Valid` annotations) |
| `h2` | bundled | ✅ Yes (dev only) |
| `lombok` | bundled | ✅ Yes (`@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`) |
| `spring-boot-devtools` | bundled | ✅ Dev hot-reload |
| `jjwt-api` | 0.11.5 | ❌ Declared, **JWT never generated or validated** |
| `jjwt-impl` | 0.11.5 | ❌ Same — no service uses it |
| `jjwt-jackson` | 0.11.5 | ❌ Same |

### 2.3 Entry Points

| Layer | Entry Point | Details |
|---|---|---|
| Frontend | `frontend/src/main.jsx` | Mounts `<App />` to `#root` |
| Frontend router | `frontend/src/App.jsx` | All routes, auth guards |
| Backend | `BackendApplication.java:main()` | `SpringApplication.run()` on port 8080 |
| Python AI | `backend/app/main.py` | `FastAPI()` instance — no port set, only 2 stub routes |

### 2.4 Configuration Files

| File | Key Settings |
|---|---|
| `application.properties` | Port 8080, H2 in-memory, JWT secret **hardcoded in plaintext**, CORS `localhost:5173` only |
| `frontend/index.html` | Google Fonts Inter loaded from CDN |
| `frontend/eslint.config.js` | Standard React hooks + refresh rules |
| `.github/workflows/deploy.yml` | 5 jobs: build-backend, build-frontend, test, deploy-backend, deploy-frontend |

### 2.5 Third-Party Integrations

| Integration | Location | Status |
|---|---|---|
| OpenAI API | `application.properties` line: `openai.api.key=${OPENAI_API_KEY:}` | Key slot only — no code uses it |
| Google Fonts (Inter) | `frontend/index.html` CDN link | ✅ Working |
| Vercel (FE deploy) | `.github/workflows/deploy.yml` | Configured, needs `VERCEL_TOKEN`, `ORG_ID`, `PROJECT_ID` secrets |
| Render (BE deploy) | `.github/workflows/deploy.yml` | Configured, needs `RENDER_API_KEY`, `BACKEND_SERVICE_ID` secrets |
| Slack / Teams / Jira / GitHub / Salesforce | `mockApi.js` settings data | UI toggles only — no real integration code exists |

---

## 3. Functional Analysis

### 3.1 Module-by-Module Feature Breakdown

#### Landing Page (`pages/Landing.jsx`)
- Video hero (`/Videos/hero-bg.mp4`) — `autoPlay loop muted playsInline`, fades in on `onCanPlay`
- 2-column layout: left text + right dashboard mockup card
- Sections: Features (3 cards), Solutions (3 cards), Pricing (3 tiers), Trust band (4 badges)
- Contact section with AI SVG background (`/ai-bg.svg`), glassmorphism panels, working form with 900ms simulated send
- Footer with 4 columns, social buttons, quick links
- Smooth-scroll navigation via `scrollIntoView`

#### Auth (`pages/Login.jsx`, `pages/Register.jsx`, `context/AuthContext.jsx`)
- **Login:** Email + password, demo fill (`demo@enterprise.ai` / `demo123`), show/hide password, remember me checkbox → stores to `localStorage` key `eai_user`
- **Register:** 5 fields with real-time per-field validation, password strength meter (4 levels), terms checkbox required, fill-demo button, success screen with 2-second redirect
- **AuthContext:** `useState` + `useEffect` reads `localStorage` on mount; `login()`, `logout()`, `updateProfile()` — no token, no server call

#### Dashboard (`pages/Dashboard.jsx`)
- 4 stat cards: Total Documents (1,247), AI Queries (18,245), Active Users (892), Total Savings ($18.5K) — all from `mockData.getStats()`
- Recent activity feed — 6 items from `mockData.getActivity()`
- 4 quick-action buttons: New Document, AI Chat, Upload File, View Analytics — all use `useNavigate()`
- Mini AI chat widget with `useState` messages, random reply from 4 hardcoded strings, typing indicator (1.2s delay)

#### Knowledge Base (`pages/KnowledgeBase.jsx`)
- 8 pre-seeded articles from `mockData.getKnowledgeBase()` stored in `useState`
- Category filter chips: All, HR, IT, Finance, General
- Real-time search filtering across title + category + content
- View modal, Edit modal (saves to local state), Delete (window.confirm + local state filter)
- Create new article form modal — adds to local state only

#### Documents (`pages/Documents.jsx`)
- 10 pre-seeded documents from `mockData.getDocuments()` stored in `useState`
- Table with type icon, name, size, uploader, date, status badge
- Search filter works on name + type + uploader
- Upload modal: drag-and-drop (`onDrop`) + click-to-browse (`FileReader`), shows file name/size, simulated upload (1.2s), sets new doc to `processing` status, auto-transitions to `processed` after 3s
- View modal: shows metadata + download button (toast only)
- Delete: removes from local state, toast notification

#### AI Chat (`pages/Chat.jsx`)
- 5 pre-seeded conversation stubs from `mockData.getChatHistory()`
- Clicking a conversation loads messages from `mockData.getChatMessages(chatId)` — only IDs 1 and 2 have real messages; all others fall back to ID 1
- New chat: creates local entry, pre-populates with one assistant greeting
- Send: adds user bubble, 1.4s typing indicator, random AI reply from `AI_REPLIES` array (6 strings)
- Delete conversation from sidebar
- Copy message button with 2s checkmark feedback
- Suggestion chips on empty state
- Enter to send, Shift+Enter for newline

#### Analytics (`pages/Analytics.jsx`)
- 4 stat cards from `mockData.getAnalytics().stats`
- Recharts `BarChart`: AI Queries + Document Uploads per day (7 days)
- Recharts `LineChart`: User Growth per month (6 months)
- CSS bar chart: Queries by department (5 departments)
- Activity table: 6 rows with user, query, dept, time, status
- Date range filter (Today / This Week / This Month / This Year) — UI state only, does not change data
- Export button: 900ms delay + `alert()` dialog

#### Settings (`pages/Settings.jsx`)
- 4 tabs: General, Security, Notifications, Integrations
- General: Company Name (input), Timezone (select, 8 options), Language (select, 6 options), Date Format (select)
- Security: 2FA toggle, IP Whitelist toggle, session timeout input, password expiry input, inline change-password form
- Notifications: 5 toggle switches (email, push, weekly digest, query alerts, security alerts)
- Integrations: 6 integration rows (Slack, Teams, Google, Jira, GitHub, Salesforce) with toggle + status label
- Save button: sets `saved` state for 3s, shows success banner. **Data does not persist past page reload**
- Reset Defaults: calls `mockData.getSettings()` again

#### Profile (`pages/Profile.jsx`)
- Avatar: `<input type="file" accept="image/*">` with `FileReader` base64 preview
- Personal info form: Name, Email, Phone, Location, Company, Department (select), Bio
- Save Profile: calls `AuthContext.updateProfile()` — persists to `localStorage`
- Change password: 3 inputs with client-side validation (current, new, confirm) — no server call
- 2FA toggle: local state only
- Danger zone: `window.confirm()` + `window.alert()` — no server call

#### Layout (`components/Layout.jsx`)
- Collapsible sidebar (240px ↔ 68px) with collapse button in header
- 7 `NavLink` items with `isActive` styling
- User menu dropdown (Profile, Settings, Sign Out) — clicks `useNavigate()`
- Notifications dropdown: 4 hardcoded notifications (2 unread)
- Plan badge in header
- Uses React Router `<Outlet>` — all protected pages render inside here

### 3.2 Backend API Endpoint Table

| Method | Route | Purpose | Auth Required | Request Body | Response |
|---|---|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | ❌ None | `{name, email, password, department}` | `{message, userId}` or `{error}` |
| `POST` | `/api/auth/login` | Authenticate user | ❌ None | `{email, password}` | `{message, userId, name, role}` or 401 `{error}` |
| `GET` | `/api/chat/messages` | Get all chat messages | ❌ None | Query: `?userId=` (ignored) | `List<ChatMessage>` |
| `POST` | `/api/chat/message` | Send message, get AI response | ❌ None | `{message, userId}` | `{response, messageId}` |
| `GET` | `/api/documents` | List all documents | ❌ None | — | `List<Document>` |
| `POST` | `/api/documents/upload` | Upload a file | ❌ None | `multipart/form-data: file` | `Document` JSON or error string |
| `GET` | `/api/dashboard/stats` | Get platform statistics | ❌ None | — | `{totalEmployees, totalDocuments, totalChats, aiQueriesToday, costSaved}` |
| `GET` | `/api/test` | Health check | ❌ None | — | `{message, status, timestamp}` |
| `GET` | `/api/test/health` | Service health | ❌ None | — | `{status, service}` |
| `GET` | `/h2-console/**` | H2 database UI | ❌ None | — | H2 web console |
| `GET` | `/` (Python) | Python stub root | ❌ None | — | `{message}` |
| `GET` | `/health` (Python) | Python health | ❌ None | — | `{status}` |

> **Every single backend endpoint has zero authentication enforcement.** `SecurityConfig.java` calls `.anyRequest().permitAll()`.

### 3.3 Database Schema

**Dialect:** H2 in-memory (data lost on restart). DDL auto-generated by Hibernate from entity classes.

#### `users` table (`entity/User.java`)

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | VARCHAR(36) | PK, UUID auto-generated | Hibernate `GenerationType.UUID` |
| `name` | VARCHAR(255) | NOT NULL | — |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | — |
| `password` | VARCHAR(255) | NOT NULL | BCrypt hashed |
| `role` | VARCHAR(255) | — | Default `"USER"` |
| `department` | VARCHAR(255) | — | Nullable |
| `active` | BOOLEAN | — | Default `true` |
| `created_at` | TIMESTAMP | — | `@PrePersist` |
| `updated_at` | TIMESTAMP | — | `@PreUpdate` |

#### `documents` table (`entity/Document.java`)

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | VARCHAR(36) | PK, UUID auto-generated | — |
| `name` | VARCHAR(255) | — | Original filename |
| `type` | VARCHAR(255) | — | MIME type from MultipartFile |
| `size` | BIGINT | — | Bytes |
| `url` | VARCHAR(255) | — | Local path `/uploads/UUID_filename` |
| `user_id` | VARCHAR(255) | — | No FK constraint — orphan risk |
| `created_at` | TIMESTAMP | — | `@PrePersist` |

#### `chat_messages` table (`entity/ChatMessage.java`)

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | VARCHAR(36) | PK, UUID auto-generated | — |
| `user_id` | VARCHAR(255) | — | No FK — string only |
| `message` | TEXT | — | User input |
| `response` | TEXT | — | Hardcoded keyword-matched response |
| `created_at` | TIMESTAMP | — | `@PrePersist` |

**Relationships:** None. No `@ManyToOne`, `@OneToMany`, or `@JoinColumn` exists anywhere. All "relationships" are plain `String userId` fields — no referential integrity.

**Migrations:** None. `spring.jpa.hibernate.ddl-auto=update` means schema is rebuilt from entities on startup. No Flyway, no Liquibase.

**Indexes:** None explicitly defined. H2 auto-indexes primary keys only.

### 3.4 AI Model Integration

| Component | File | Status |
|---|---|---|
| OpenAI API key slot | `application.properties:21` → `openai.api.key=${OPENAI_API_KEY:}` | Key slot only — no code reads or uses this value |
| AI response generation | `ChatController.java:getAIResponse()` | Keyword if-else switch — not AI, hardcoded strings |
| RAG pipeline | — | Does not exist anywhere in the codebase |
| Vector database | — | Does not exist |
| Document parsing | — | Does not exist (files are saved to disk but never read) |
| Python AI service | `backend/app/main.py` | 2 stub routes, no ML code, no LangChain, no model loading |
| Frontend AI simulation | `mockApi.js` + `Chat.jsx` AI_REPLIES array | 6 hardcoded random strings — no AI |

---

## 4. Quality & Security Review

### 4.1 Code Duplication & Dead Code

| Issue | Location | Detail |
|---|---|---|
| Dead dependency — `axios` | `frontend/package.json` | Imported in `api.js` but `api.js` is never imported by any page |
| Dead file — `api.js` | `frontend/src/services/api.js` | Defines `authAPI` and `API` axios instance; zero imports across the codebase |
| Dead dependency — `lucide-react` | Root `package.json` | Declared but never imported anywhere |
| Dead deps — `@types/react`, `@types/react-dom` | `frontend/package.json` devDeps | TypeScript type packages in a pure JavaScript project |
| Dead dep — `spring-boot-starter-validation` | `backend/pom.xml` | No `@Valid`, `@NotNull`, or `@RequestBody` validation annotation exists in any controller |
| Dead deps — `jjwt-api`, `jjwt-impl`, `jjwt-jackson` | `backend/pom.xml` | JWT library declared; no JWT service, filter, or token generation exists anywhere |
| Empty `security/` package | `backend/src/main/java/.../security/` | Directory exists, completely empty |
| Empty `service/` package | `backend/src/main/java/.../service/` | Directory exists, completely empty |
| Empty `dto/` package | `backend/src/main/java/.../dto/` | Directory exists, completely empty |
| Empty `database/`, `docker/`, `docs/` | Repository root | All empty directories |
| Duplicate `Toggle` component | `pages/Settings.jsx:5` and `pages/Profile.jsx:5` | Identical `function Toggle({on, onChange})` defined in two separate files |
| `BCryptPasswordEncoder` instantiated in controller | `AuthController.java:17` | `new BCryptPasswordEncoder()` created inline — should be a `@Bean` |
| `@Autowired` field injection | `ChatController.java`, `DashboardController.java`, `DocumentController.java` | Spring deprecated field injection; constructor injection is recommended |
| Mock data disconnected from backend | All page files | Every page imports `mockApi.js` directly; zero pages call the Spring Boot API |
| Chat `getChatMessages` falls back silently | `mockApi.js:getChatMessages()` | For chatIds 3–5, `sets[chatId]` is `undefined`, silently returns `sets[1]` — user sees wrong conversation |

### 4.2 Error Handling & Logging

| Area | Finding | Severity |
|---|---|---|
| `DocumentController.java:uploadDocument()` | Catches generic `Exception` and returns the raw `e.getMessage()` to the client — exposes internal stack trace details | Medium |
| `AuthContext.jsx:useEffect` | Catches `JSON.parse` failure silently — clears storage and continues. Acceptable but logs nothing | Low |
| `ChatController.java` | No try/catch around `chatMessageRepository.save()` — a DB failure would return an unhandled 500 | Medium |
| `DashboardController.java` | No error handling on repository count calls | Low |
| Frontend pages | No global error boundary — any uncaught React render error shows a blank white screen | High |
| `mockApi.js` | `delay()` promises never reject — simulated failures not modeled | Low |
| Logging | `application.properties` sets `logging.level.org.springframework.security=DEBUG` — verbose security debug logs will appear in production | Medium |
| No structured logging | No Logback config, no MDC correlation IDs, no request tracing | Medium |

### 4.3 Security Issues

| ID | Issue | Severity | Location |
|---|---|---|---|
| SEC-01 | **JWT secret hardcoded in plaintext** | 🔴 HIGH | `application.properties:14` — `jwt.secret=404E635266...` |
| SEC-02 | **H2 console exposed with no auth** | 🔴 HIGH | `SecurityConfig.java:16`, `application.properties:9-10` — `/h2-console/**` is fully public |
| SEC-03 | **All API endpoints completely unauthenticated** | 🔴 HIGH | `SecurityConfig.java:14-20` — `.anyRequest().permitAll()` |
| SEC-04 | **JWT dependency declared but never implemented** | 🔴 HIGH | `pom.xml` + all controllers — login returns userId in plain JSON, no token |
| SEC-05 | **User session stored as plain object in localStorage** | 🔴 HIGH | `AuthContext.jsx:11` — entire user object including role serialized to `eai_user` key; trivially forgeable |
| SEC-06 | **CSRF disabled globally** | 🟡 MEDIUM | `SecurityConfig.java:12` — `csrf.disable()` — acceptable only for pure SPA+JWT, not acceptable without JWT |
| SEC-07 | **Raw exception messages returned to client** | 🟡 MEDIUM | `DocumentController.java:45` — `"Upload failed: " + e.getMessage()` |
| SEC-08 | **No input validation on any controller** | 🟡 MEDIUM | `AuthController.java` — `request.get("email")` used directly with no null-check, format validation, or length limit |
| SEC-09 | **H2 frame options disabled** | 🟡 MEDIUM | `SecurityConfig.java:21` — `headers.frameOptions(frame -> frame.disable())` — exposes clickjacking surface |
| SEC-10 | **No file type validation on upload** | 🟡 MEDIUM | `DocumentController.java:uploadDocument()` — any file type accepted; no MIME whitelist, no size limit |
| SEC-11 | **No rate limiting** | 🟡 MEDIUM | Any endpoint can be called unlimited times with no throttle |
| SEC-12 | **Document URL is a local filesystem path** | 🟡 MEDIUM | `document.setUrl("/uploads/" + fileName)` — exposes internal directory structure |
| SEC-13 | **CORS hardcodes localhost in production config** | 🟡 MEDIUM | `SecurityConfig.java` and all `@CrossOrigin` annotations — will fail in production |
| SEC-14 | **No password policy** | 🟡 MEDIUM | `AuthController.java` — no minimum length or complexity check server-side |
| SEC-15 | **`@CrossOrigin` duplicated per controller** | 🟢 LOW | `AuthController`, `ChatController`, `DocumentController`, `DashboardController`, `TestController` — CORS already handled in `SecurityConfig`, per-controller annotations are redundant and inconsistent |

### 4.4 Performance Bottlenecks

| Issue | Location | Detail |
|---|---|---|
| H2 in-memory database | `application.properties` | Entire database lost on restart — not viable for any persistent data scenario |
| `documentRepository.findAll()` | `DocumentController.java:getAll()` | No pagination — returns entire table on every request |
| `chatMessageRepository.findAll()` | `ChatController.java:getMessages()` | No pagination — returns entire message table |
| `userRepository.count()` + `documentRepository.count()` + `chatMessageRepository.count()` | `DashboardController.java:getStats()` | 3 separate DB calls per stats request — could be batched |
| Video autoplay | `Landing.jsx` | `hero-bg.mp4` in `/public` — no compression configured, no lazy loading, may block LCP |
| All mock data returned synchronously | `mockApi.js` | `getStats()`, `getDocuments()`, etc. have `delay()` only on auth — data functions return instantly, bypassing any loading state testing |
| Bundle size | `dist/assets/index-*.js` = 752 KB gzipped 218 KB | Recharts is the primary contributor; no code splitting configured |

### 4.5 Test Coverage

| Layer | Tests Found | Coverage |
|---|---|---|
| Backend unit tests | **0** — `backend/src/test/` directory is empty | 0% |
| Frontend unit tests | **0** — no test files, no Vitest/Jest config | 0% |
| Integration tests | **0** | 0% |
| E2E tests | **0** — no Playwright/Cypress config | 0% |
| CI test step | `deploy.yml:test job` runs `mvn test` and `npm run build` | Builds only — not tests |

> **Total test coverage: 0%.** The CI pipeline's `test` job runs Maven test (which will pass with no test classes) and an npm build check — it is not actually testing any behavior.

---

## 5. DevOps & Deployment

### 5.1 Build Scripts

| Script | File | Command | Notes |
|---|---|---|---|
| Windows full build | `build.bat` | `mvn clean package -DskipTests` + `npm run build` | `-DskipTests` skips tests in production build |
| Backend build | `backend/pom.xml` | `mvn clean install` | Spring Boot Maven plugin configured |
| Frontend dev | `frontend/package.json` | `npm run dev` → `vite` | Dev server |
| Frontend build | `frontend/package.json` | `npm run build` → `vite build` | Outputs to `frontend/dist/` |
| Frontend lint | `frontend/package.json` | `npm run lint` → `eslint .` | Standard React hooks rules |

### 5.2 CI/CD Pipeline

**File:** `.github/workflows/deploy.yml`

**Trigger:** Push or PR to `main` / `master`

**Jobs:**

```
build-backend  ──┐
                 ├──► test ──► deploy-backend  (only on main/master)
build-frontend ──┘        └──► deploy-frontend (only on main/master)
```

| Job | Runner | Key Steps | Issues |
|---|---|---|---|
| `build-backend` | ubuntu-latest | Checkout → JDK 17 (Temurin) → `mvn clean install -DskipTests` → upload artifact | `-DskipTests` means no tests run |
| `build-frontend` | ubuntu-latest | Checkout → Node 18 → `npm ci` → `npm run build` → upload artifact | Node 18 used in CI; local dev uses whatever is installed |
| `test` | ubuntu-latest | `mvn test` (0 test classes = instant pass) + `npm run build` | Not real testing — just compilation |
| `deploy-backend` | ubuntu-latest | Downloads JAR → `curl` POST to Render API | Needs `RENDER_API_KEY` + `BACKEND_SERVICE_ID` secrets |
| `deploy-frontend` | ubuntu-latest | Uses `amondnet/vercel-action@v20` | Needs `VERCEL_TOKEN`, `ORG_ID`, `PROJECT_ID` secrets |

> **Issue:** `amondnet/vercel-action@v20` is a pinned major version — not pinned to a SHA. Supply-chain risk if the action is compromised.

### 5.3 Environment Variable Management

| Variable | Location | Issue |
|---|---|---|
| `OPENAI_API_KEY` | `application.properties:21` as `${OPENAI_API_KEY:}` | Defaults to empty string — no startup validation |
| `jwt.secret` | `application.properties:14` — **hardcoded value** | 🔴 Must be externalized immediately |
| `spring.datasource.password` | `application.properties:7` — **empty string** | No password on dev DB (acceptable for H2 dev only) |
| `RENDER_API_KEY` | `deploy.yml:secrets.RENDER_API_KEY` | Correctly externalized as GitHub secret |
| `VERCEL_TOKEN` | `deploy.yml:secrets.VERCEL_TOKEN` | Correctly externalized as GitHub secret |
| Frontend API URL | Hardcoded as `http://localhost:8080/api` in `api.js:4` | No environment variable — `VITE_API_URL` env var not configured |

### 5.4 Docker / Infrastructure-as-Code

| Asset | Status |
|---|---|
| `docker/` directory | **Empty** — no Dockerfile, no docker-compose.yml |
| Kubernetes manifests | None |
| Infrastructure-as-code (Terraform/CDK) | None |
| `.env` / `.env.example` files | None |

### 5.5 Deployment Readiness

| Check | Status | Blocker? |
|---|---|---|
| Frontend builds clean | ✅ 607 modules, 0 errors | No |
| Backend compiles | ✅ Maven clean package succeeds | No |
| Database persistence | ❌ H2 in-memory — data lost on restart | **Yes** |
| JWT authentication | ❌ Not implemented | **Yes** |
| All routes authenticated | ❌ `.permitAll()` on everything | **Yes** |
| Environment variables externalized | ❌ JWT secret hardcoded | **Yes** |
| Frontend connected to backend | ❌ Uses mockApi.js only | **Yes** |
| Docker images | ❌ No Dockerfile | No (Render can auto-build) |
| Test suite | ❌ 0% coverage | No (not a deploy blocker but a quality blocker) |
| CORS production origins | ❌ Hardcoded localhost | **Yes** |
| H2 console disabled for prod | ❌ Enabled with no auth | **Yes** |

---

## 6. Risks & Recommendations

### 6.1 Issue Table

| ID | Description | Severity | Location | Recommended Fix |
|---|---|---|---|---|
| R-01 | JWT secret hardcoded in plaintext in `application.properties` | 🔴 HIGH | `application.properties:14` | Move to `${JWT_SECRET}` env var; set via GitHub Secret and Render env |
| R-02 | All API endpoints publicly accessible — no authentication enforced | 🔴 HIGH | `SecurityConfig.java:14-20` | Implement JWT filter in `security/` package; protect all `/api/**` except `/api/auth/**` |
| R-03 | JWT dependency declared but no token is ever generated or validated | 🔴 HIGH | `pom.xml` + `AuthController.java:login()` | Create `JwtService.java` in `service/`; generate token on login; validate on each request |
| R-04 | H2 console exposed publicly with no authentication | 🔴 HIGH | `SecurityConfig.java:16` + `application.properties:9` | Add Spring profile `dev` to restrict H2 console; disable in `prod` profile |
| R-05 | Frontend session stored as plain user object in localStorage — trivially forgeable | 🔴 HIGH | `AuthContext.jsx:11-13` | Store only JWT token in localStorage; validate token on backend for every request |
| R-06 | H2 in-memory database loses all data on restart | 🔴 HIGH | `application.properties:5-6` | Add PostgreSQL dependency; create `prod` profile with PostgreSQL JDBC URL |
| R-07 | Frontend completely disconnected from backend — uses only mock data | 🔴 HIGH | All page files | Replace `mockApi.js` imports with calls to `api.js`; wire each page to its backend endpoint |
| R-08 | No input validation on any backend controller | 🟡 MEDIUM | `AuthController.java:23-45` | Add `@Valid` + DTO classes with `@NotBlank`, `@Email`, `@Size`; `spring-boot-starter-validation` already declared |
| R-09 | Raw exception message returned to client on upload failure | 🟡 MEDIUM | `DocumentController.java:45` | Return generic error message; log actual exception server-side |
| R-10 | No file type or size validation on document upload | 🟡 MEDIUM | `DocumentController.java:uploadDocument()` | Whitelist MIME types (`application/pdf`, `application/vnd.openxmlformats...`); enforce max size (e.g., 50MB) |
| R-11 | No React error boundary — any render error shows blank white screen | 🟡 MEDIUM | Entire frontend | Add `<ErrorBoundary>` wrapping `<App>` in `main.jsx` |
| R-12 | CORS allows only `localhost` — will reject all production requests | 🟡 MEDIUM | `SecurityConfig.java:30-34` + all `@CrossOrigin` | Externalize allowed origins to `${CORS_ALLOWED_ORIGINS}` env var |
| R-13 | Date range filter in Analytics has no effect on chart data | 🟡 MEDIUM | `Analytics.jsx:range` state | Connect `range` state to filter the `queriesByDay` and `userGrowth` datasets |
| R-14 | Settings and Knowledge Base changes do not persist past page reload | 🟡 MEDIUM | `Settings.jsx`, `KnowledgeBase.jsx` | Either connect to backend API or persist to localStorage as interim solution |
| R-15 | `getChatMessages(chatId)` silently returns wrong data for chatIds 3–5 | 🟡 MEDIUM | `mockApi.js:getChatMessages()` | Add all 5 message sets; or show empty state for missing IDs |
| R-16 | Duplicate `Toggle` component defined in two files | 🟢 LOW | `Settings.jsx:5-11`, `Profile.jsx:5-11` | Extract to `components/common/Toggle.jsx` |
| R-17 | `BCryptPasswordEncoder` instantiated inside controller | 🟢 LOW | `AuthController.java:17` | Declare as `@Bean` in `SecurityConfig` and inject via constructor |
| R-18 | `@Autowired` field injection used in 3 controllers | 🟢 LOW | `ChatController`, `DashboardController`, `DocumentController` | Switch to constructor injection |
| R-19 | `lucide-react` declared at root but never used | 🟢 LOW | Root `package.json` | Remove from root dependencies |
| R-20 | `@types/react` / `@types/react-dom` in JS project | 🟢 LOW | `frontend/package.json` devDeps | Remove — no TypeScript; these waste install time |
| R-21 | CI `test` job does not run any real tests | 🟢 LOW | `.github/workflows/deploy.yml:test` | Write at minimum one integration test per controller; add Vitest for frontend |
| R-22 | `amondnet/vercel-action@v20` not pinned to SHA | 🟢 LOW | `deploy.yml:deploy-frontend` | Pin to full commit SHA for supply-chain safety |
| R-23 | `logging.level.org.springframework.security=DEBUG` in production config | 🟢 LOW | `application.properties:19` | Move debug logging to `application-dev.properties` only |
| R-24 | No foreign key constraints on `chat_messages.user_id` or `documents.user_id` | 🟢 LOW | `ChatMessage.java`, `Document.java` | Add `@ManyToOne @JoinColumn(name="user_id")` with proper FK relationship |
| R-25 | Python FastAPI service has no business logic, no port configured | 🟢 LOW | `backend/app/main.py` | Either build out or remove; if keeping, add `uvicorn` config and document startup command |

### 6.2 Technical Debt Inventory

| Debt Item | Effort | Impact |
|---|---|---|
| Implement JWT filter + token generation | Medium (2–3 days) | Critical — security |
| Replace mock data with real API calls across all 7 pages | Medium (3–5 days) | Critical — real product |
| PostgreSQL migration + profiles (dev/prod) | Small (1 day) | Critical — data persistence |
| Create service layer (all business logic is in controllers) | Medium (2–3 days) | High — testability |
| Create DTO layer (controllers use raw `Map<String,String>`) | Small (1 day) | High — type safety |
| Write test suite (unit + integration) | Large (5–7 days) | High — reliability |
| Build Python RAG pipeline with LangChain | Large (7–14 days) | Core product value |
| Connect document upload to AI indexing pipeline | Large (5–7 days) | Core product value |
| Docker + docker-compose for local full-stack dev | Small (1 day) | Medium — developer experience |

### 6.3 Missing Features / Incomplete Implementations

| Feature | Expected Location | Current State |
|---|---|---|
| JWT token generation | `AuthController.java:login()` | Returns plain JSON — no token |
| JWT token validation filter | `security/` package | Entire package empty |
| OpenAI / LLM integration | Backend AI service | Key slot only — no code |
| RAG document indexing | Python `main.py` | 4-line stub |
| Knowledge Base backend storage | No endpoint exists | Frontend state only |
| Analytics date range filtering | `Analytics.jsx` | UI state only — data unchanged |
| User profile backend persistence | No endpoint exists | Only localStorage |
| Settings backend persistence | No endpoint exists | Only in-memory |
| Pagination on all list endpoints | All `findAll()` calls | None |
| Document delete endpoint | `DocumentController.java` | Only `GET` and `POST` exist — no `DELETE` |
| Password change endpoint | Backend | No endpoint |
| Chat conversation threading | Backend | All messages flat, no conversation grouping |
| 2FA implementation | Backend | Toggle exists in UI only |

---

## 7. Summary Report

### 7.1 Overall Project Health Score

| Dimension | Score | Justification |
|---|---|---|
| **UI/UX Quality** | 9/10 | Professional dark theme, glassmorphism, video hero, responsive, full page set |
| **Frontend Architecture** | 7/10 | Clean routing, good component structure, context auth — but mock data disconnected |
| **Backend Architecture** | 4/10 | Correct structure exists but service/security/dto layers all empty |
| **Security** | 2/10 | Hardcoded secret, no auth, all endpoints public, localStorage session |
| **API Integration** | 1/10 | Frontend and backend run completely independently — zero wiring |
| **AI Implementation** | 1/10 | Keyword if-else in Java controller + 4-line Python stub — no AI exists yet |
| **Test Coverage** | 0/10 | Zero tests at any layer |
| **DevOps** | 5/10 | CI/CD pipeline exists and deploys correctly, but no Docker, no env management |
| **Data Persistence** | 2/10 | H2 in-memory loses all data on restart; no migration strategy |

**Overall Health Score: 4.5 / 10**

The frontend is polished and production-quality in visual terms. The backend has the correct skeleton. But the two are not connected, security is unimplemented, there are no tests, and the core AI value proposition does not exist in any form.

---

### 7.2 Top 5 Action Items

**1. Connect the frontend to the backend (R-07)**
Every page imports `mockApi.js`. `api.js` exists and already has an axios instance pointed at `localhost:8080`. The work is replacing `mockApi.js` imports with actual `api.js` calls, page by page. Without this, the product cannot be demonstrated to real users.

**2. Implement JWT properly (R-02, R-03, R-04, R-05)**
The JWT library is already installed. Create `JwtService.java` in the empty `service/` package, generate a token on login, and add a `JwtAuthFilter` to the empty `security/` package. Without this, any user can call any endpoint and impersonate any other user.

**3. Externalize secrets and migrate to PostgreSQL (R-01, R-06)**
Move `jwt.secret` to an environment variable immediately. Add a `prod` Spring profile with PostgreSQL. Without this, the JWT secret is compromised as soon as the repo is shared and all data disappears on every restart.

**4. Build the AI layer (R-07, Python stub)**
The entire product value is RAG-based document Q&A. Replace `ChatController.getAIResponse()` keyword matching with an actual call to the Python service. Build out `main.py` with LangChain + ChromaDB. Connect the document upload pipeline to vector indexing. Without this, the platform is a standard CRUD app, not an AI platform.

**5. Write tests and fix the H2 console exposure (R-04, R-21)**
Disable the H2 console outside the dev profile. Write at minimum one integration test per controller using `@SpringBootTest`. Add Vitest to the frontend. The CI pipeline currently passes tests that don't exist.

---

### 7.3 Recommended Next Steps & Roadmap

**Sprint 1 — Security & Integration Foundation (Week 1–2)**
- Implement `JwtService` + `JwtAuthFilter` in backend
- Externalize `jwt.secret` to env var
- Add PostgreSQL dev profile
- Wire `Login.jsx` and `Register.jsx` to call real backend `/api/auth/` endpoints
- Disable H2 console in prod profile

**Sprint 2 — Full Frontend-Backend Integration (Week 3–4)**
- Replace all `mockApi.js` imports with `api.js` calls
- Create DTO classes for request/response bodies
- Create service layer extracting logic from controllers
- Add `@Valid` + DTO validation on all controller inputs
- Add pagination to `findAll()` endpoints

**Sprint 3 — AI Implementation (Week 5–8)**
- Set up Python FastAPI with LangChain + ChromaDB
- Implement document upload → text extraction → vector embedding pipeline
- Implement RAG query endpoint
- Replace `ChatController.getAIResponse()` with HTTP call to Python service
- Connect OpenAI API key

**Sprint 4 — Quality & Production Hardening (Week 9–10)**
- Write unit + integration tests (target ≥ 60% coverage)
- Add Docker + docker-compose for all three services
- Configure CORS for production domains
- Add error boundary to frontend
- Extract `Toggle` component; remove dead dependencies

---

## Executive Summary

The Enterprise AI Platform is a well-designed, visually polished web application with a professional dark-theme UI, full page coverage (10 routes), and a correct three-tier skeleton (React 19 frontend, Spring Boot 3.2.5 backend, Python FastAPI stub). However, a thorough code review reveals that the three tiers are completely disconnected — the frontend uses only static mock data, the backend runs independently and is never called by any page, and the Python AI service is a 4-line stub with no business logic. The backend has critical security vulnerabilities including a hardcoded JWT secret, fully public API endpoints with no authentication enforcement, and an exposed H2 database console. Despite JWT and validation libraries being declared in `pom.xml`, neither feature is implemented — the `security/` and `service/` package directories are both empty. The platform currently has zero test coverage at every layer. For a competition submission the current MVP demonstrates strong UI/UX skills and a credible product vision. For a production or investor deployment, the five highest-priority actions are: connecting the frontend to the backend, implementing JWT authentication properly, externalizing secrets and migrating to PostgreSQL, building the actual AI/RAG pipeline, and writing a minimum viable test suite.

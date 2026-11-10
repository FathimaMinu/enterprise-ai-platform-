# API Reference — Enterprise AI Platform

Base URL: `http://localhost:8080/api`  
Auth: `Authorization: Bearer <JWT token>` on all protected routes.

---

## Authentication (Public)

### POST /api/auth/register
Register a new user account.

**Request**
```json
{
  "name":       "John Doe",
  "email":      "john@company.com",
  "password":   "SecurePass1!",
  "department": "Technology"
}
```

**Response 201**
```json
{
  "token":  "eyJhbGci...",
  "userId": "uuid",
  "name":   "John Doe",
  "role":   "USER"
}
```

**Errors**: `400` duplicate email | `400` validation failure with `fieldErrors`

---

### POST /api/auth/login
Authenticate and receive a JWT.

**Request**
```json
{ "email": "john@company.com", "password": "SecurePass1!" }
```

**Response 200**
```json
{
  "token":  "eyJhbGci...",
  "userId": "uuid",
  "name":   "John Doe",
  "role":   "USER"
}
```

**Errors**: `400` invalid credentials

---

## Profile (Protected)

### GET /api/profile
Return the authenticated user's profile.

**Response 200** — `User` object (password omitted)

---

### PUT /api/profile
Update profile fields.

**Request** (all fields optional)
```json
{
  "name": "Jane Doe", "phone": "+1 555 0001",
  "location": "NYC", "company": "Acme", "department": "HR", "bio": "..."
}
```

**Response 200** — updated `User` object

---

### POST /api/profile/change-password

**Request**
```json
{ "currentPassword": "OldPass1!", "newPassword": "NewPass1!" }
```

**Response 200** `{ "message": "Password updated successfully" }`

---

### POST /api/profile/avatar
Upload a profile avatar image (PNG or JPG, max 5 MB).

**Request** `multipart/form-data` — field name: `file`  
**Response 200** `{ "avatarUrl": "/uploads/avatars/..." }`

---

## Dashboard (Protected)

### GET /api/dashboard/stats

**Response 200**
```json
{
  "totalEmployees": 12,
  "totalDocuments": 45,
  "totalChats":     238,
  "aiQueriesToday": 238,
  "costSaved":      1190.0
}
```

---

## Documents (Protected)

### GET /api/documents
List all documents ordered by upload date descending.

**Response 200** — array of `DocumentResponse`
```json
[{ "id":"uuid", "name":"Report.pdf", "type":"application/pdf",
   "size":2457600, "url":"/uploads/...", "uploadedBy":"user-uuid",
   "status":"processed", "createdAt":"2024-06-15T10:00:00" }]
```

---

### GET /api/documents/{id}
Get a single document.

---

### POST /api/documents/upload
Upload a document file. MIME: PDF, DOCX, XLSX, TXT, PNG, JPG. Max 50 MB.

**Request** `multipart/form-data` — field name: `file`  
**Response 200** — `DocumentResponse`  
**Errors**: `400` unsupported MIME | `400` file too large | `413` payload too large

---

### DELETE /api/documents/{id}
Delete a document and its physical file.

**Response 204** No Content

---

## Knowledge Base (Protected)

### GET /api/knowledge-base
List articles with optional category filter and pagination.

**Query params**: `category` (HR|IT|Finance|General|Operations|Legal), `page` (default 0), `size` (default 20)

**Response 200** — paginated Spring Data `Page<KnowledgeBase>`

---

### GET /api/knowledge-base/{id}
Get article (also increments view count).

---

### POST /api/knowledge-base
Create a new article.

**Request**
```json
{ "title": "Leave Policy", "content": "...", "category": "HR" }
```

**Response 201**

---

### PUT /api/knowledge-base/{id}
Update an article.

---

### DELETE /api/knowledge-base/{id}
**Response 204**

---

## AI Chat (Protected)

### GET /api/chat/messages
Return all messages for the authenticated user (ordered desc).

**Response 200** — array of `ChatMessage`

---

### POST /api/chat/message
Send a message and receive an AI-generated response.

**Request**
```json
{ "message": "What is the vacation policy?" }
```

**Response 200**
```json
{
  "response":  "Full-time employees receive 20 paid vacation days...",
  "messageId": "uuid",
  "timestamp": "2024-06-15T10:05:00"
}
```

---

### DELETE /api/chat/{messageId}
Delete a chat message.

**Response 204**

---

## Analytics (Protected)

### GET /api/analytics/stats

**Response 200**
```json
{
  "totalQueries": 238, "avgResponseTimeMs": 1400,
  "documentsIndexed": 45, "costSaved": 1190.0
}
```

---

### GET /api/analytics/queries?range=week
Query counts per day. `range`: today | week | month | year

**Response 200** — array of `{ day: string, queries: int }`

---

### GET /api/analytics/departments
Query counts per department.

**Response 200** — `[{ name: "IT", value: 3120 }, ...]`

---

## Settings (Protected)

### GET /api/settings
Get current user's settings (creates defaults if none exist).

---

### PUT /api/settings
Save settings.

**Request** — `Settings` entity fields (see `Settings.java`)

**Response 200** — saved `Settings` object

---

## Health (Public)

### GET /api/test/health

**Response 200** `{ "status": "UP", "service": "Enterprise AI Backend" }`

---

## Error Response Format

All errors return `ApiError`:
```json
{
  "status":      400,
  "message":     "Validation failed",
  "timestamp":   "2024-06-15T10:00:00",
  "fieldErrors": { "email": "Must be a valid email address" }
}
```

`fieldErrors` is only present for `400` validation failures.

---

## Python AI Service

Base URL: `http://localhost:8000`

### POST /api/ai/query
```json
{ "question": "What is the leave policy?", "top_k": 5 }
```
Response: `{ "answer": "...", "sources": [...] }`

### POST /api/ai/index
```json
{ "document_id": "uuid", "file_path": "/app/uploads/..." }
```
Response: `{ "document_id": "uuid", "chunks_indexed": 12, "status": "indexed" }`

### DELETE /api/ai/document
```json
{ "document_id": "uuid" }
```

### GET /api/ai/stats
Response: `{ "indexed_chunks": 148 }`

### GET /health
Response: `{ "status": "healthy", "indexed_chunks": 148, "openai_key_set": true }`

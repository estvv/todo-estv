# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                            │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   React Frontend                         │   │
│  │  - Login Page (Password → JWT Token)                     │   │
│  │  - Todo App (requires JWT token)                         │   │
│  │  - Token stored in localStorage                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                    HTTP Requests + JWT                            │
│                              ▼                                    │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Nginx (Port 80)                            │
│                                                                   │
│  - Serves static React files                                     │
│  - Proxies /api/* to backend                                     │
│  - HTTPS termination (via Caddy)                                 │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Go Backend (Port 3005)                         │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Middleware Stack                             │   │
│  │  1. Security Headers (XSS, Clickjacking protection)      │   │
│  │  2. CORS (Cross-Origin Resource Sharing)                 │   │
│  │  3. Rate Limiting (5 login, 100 general req/min)        │   │
│  │  4. JWT Auth (Protected routes only)                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                              ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  HTTP Handlers                             │   │
│  │  - /api/login (public, rate limited 5/min)              │   │
│  │  - /api/todos/* (protected)                              │   │
│  │  - /api/projects/* (protected)                           │   │
│  │  - /api/tags/* (protected)                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                              ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Business Logic Layer                         │   │
│  │  - Task limit enforcement (max 100 tasks)                │   │
│  │  - CRUD operations                                        │   │
│  │  - Data validation                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                    │
│                              ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 SQLite Database                           │   │
│  │  - todos, projects, tags, comments tables               │   │
│  │  - todo_tags (many-to-many relationship)                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Model

```
┌──────────────┐       ┌──────────────┐
│   projects   │       │     tags     │
├──────────────┤       ├──────────────┤
│ id           │       │ id           │
│ name         │       │ name         │
│ color        │       │ color        │
│ created_at   │       │ created_at   │
│ updated_at   │       └──────────────┘
└──────────────┘              │
       │                      │
       │                      │
       │               ┌──────────────┐
       │               │  todo_tags   │
       │               ├──────────────┤
       │               │ todo_id      │
       │               │ tag_id       │
       │               └──────────────┘
       │                      │
       ▼                      ▼
┌────────────────────────────────────┐
│              todos                  │
├────────────────────────────────────┤
│ id                                  │
│ title                               │
│ description                         │
│ completed (boolean)                 │
│ priority (low/medium/high)         │
│ due_date                            │
│ project_id (FK → projects.id)       │
│ parent_id (FK → todos.id, subtasks) │
│ created_at                          │
│ updated_at                          │
└────────────────────────────────────┘
              │
              │
              ▼
       ┌──────────────┐
       │   comments   │
       ├──────────────┤
       │ id           │
       │ todo_id (FK) │
       │ content      │
       │ created_at   │
       └──────────────┘
```

## Request Flow

### Authentication Flow

```
1. User enters password in Login Page
   │
   ▼
2. Frontend POST /api/login { "password": "..." }
   │
   ▼
3. Backend validates password against AUTH_PASSWORD env var
   │
   ├── Invalid → 401 Unauthorized
   │
   └── Valid → Generate JWT token (7-day expiration)
        │
        ▼
4. Backend returns { "token": "jwt-token-here" }
   │
   ▼
5. Frontend stores token in localStorage
   │
   ▼
6. Frontend includes token in all subsequent requests
   Authorization: Bearer jwt-token-here
   │
   ▼
7. Backend middleware validates token on protected routes
   │
   ├── Invalid/Expired → 401 Unauthorized → Frontend redirects to login
   │
   └── Valid → Request proceeds to handler
```

### Request Pipeline

```
Incoming Request
    │
    ▼
┌───────────────────────────┐
│   1. Security Headers      │
│   - XSS-Protection         │
│   - X-Frame-Options        │
│   - Content-Type-Options   │
│   - HSTS                   │
└───────────────────────────┘
    │
    ▼
┌───────────────────────────┐
│   2. CORS Middleware      │
│   - Adds CORS headers     │
│   - Handles preflight     │
└───────────────────────────┘
    │
    ▼
┌───────────────────────────┐
│   3. Rate Limiting       │
│   - 5 req/min (login)    │
│   - 100 req/min (API)    │
│   - Returns 429 if exceeded│
└───────────────────────────┘
    │
    ▼
┌───────────────────────────┐
│   4. JWT Authentication   │
│   (Protected routes only) │
│   - Validates JWT token   │
│   - Returns 401 if invalid│
└───────────────────────────┘
    │
    ▼
┌───────────────────────────┐
│   5. Route Handler        │
│   - Business logic        │
│   - Database operations   │
│   - Task limit checks     │
└───────────────────────────┘
```

## Security Architecture

### Layers of Protection

```
Layer 1: Network Level (Caddy)
├── HTTPS (auto TLS)
├── Reverse proxy
└── DDoS protection (built-in)

Layer 2: Container Level (Docker)
├── Memory limits (512MB backend, 128MB frontend)
├── CPU limits (1.0 backend, 0.5 frontend)
└── Network isolation

Layer 3: Application Level (Go Backend)
├── Security headers (XSS, clickjacking, etc.)
├── CORS restrictions
├── Rate limiting
├── JWT authentication
└── Input validation

Layer 4: Database Level (SQLite)
├── Parameterized queries (SQL injection prevention)
├── Transaction limits
└── Task limit enforcement (100 max)
```

### Rate Limiting Strategy

```
┌────────────────────────────────────────────────────────┐
│                  Rate Limiting Rules                    │
├────────────────────────────────────────────────────────┤
│ Endpoint            │ Limit          │ Storage         │
├────────────────────────────────────────────────────────┤
│ POST /api/login     │ 5 req/min/IP  │ In-memory store │
│ GET /api/*          │ 100 req/min/IP │ In-memory store │
│ POST /api/*         │ 100 req/min/IP │ In-memory store │
│ PUT /api/*          │ 100 req/min/IP │ In-memory store │
│ DELETE /api/*       │ 100 req/min/IP │ In-memory store │
└────────────────────────────────────────────────────────┘

When limit exceeded:
- Return HTTP 429 (Too Many Requests)
- Include Retry-After header
```

### Task Limit Enforcement

```
┌─────────────────────────────────────────┐
│         Task Creation Flow               │
├─────────────────────────────────────────┤
│ 1. Receive POST /api/todos               │
│    │                                     │
│    ▼                                     │
│ 2. Check if parent_id == null           │
│    │                                     │
│    ├── Yes (parent task)                 │
│    │   │                                 │
│    │   ▼                                 │
│    │   SELECT COUNT(*) FROM todos        │
│    │   WHERE parent_id IS NULL           │
│    │   │                                 │
│    │   ├── COUNT < 100 → Proceed          │
│    │   │                                 │
│    │   └── COUNT >= 100 → 403 Forbidden  │
│    │                                     │
│    └── No (subtask) → Proceed            │
│                                          │
│ 3. Insert into database                  │
└─────────────────────────────────────────┘
```

## Technology Stack

### Backend
- **Language**: Go 1.21
- **Framework**: Gorilla Mux (router)
- **Database**: SQLite (embedded)
- **Authentication**: golang-jwt/jwt/v5
- **Rate Limiting**: ulule/limiter/v3
- **CORS**: Custom middleware

### Frontend
- **Framework**: React 19 + TypeScript
- **Build**: Vite
- **Styling**: Tailwind CSS v4
- **Font**: Plus Jakarta Sans
- **State**: React hooks (no global state)

### Infrastructure
- **Containers**: Docker + Docker Compose
- **Reverse Proxy**: Nginx (in frontend container)
- **HTTPS**: Caddy (reverse proxy)
- **Database**: SQLite file (mounted volume)

## Performance Considerations

### Backend
- SQLite runs in-memory for reads
- No ORM overhead (raw SQL queries)
- Connection pooling via Go's database/sql
- Rate limiting uses in-memory store

### Frontend
- Static files served by Nginx
- Gzip compression enabled
- CSS bundled with Tailwind
- No runtime dependencies

### Docker
- Backend: 512MB RAM limit (prevents OOM)
- Frontend: 128MB RAM limit (lightweight)
- Multi-stage builds (small images)
- No resource contention between containers

## Scalability Limits

| Resource | Limit | Reason |
|----------|-------|--------|
| Tasks | 100 per installation | Prevent database bloat |
| Login attempts | 5 per minute per IP | Brute force prevention |
| API requests | 100 per minute per IP | API abuse prevention |
| Backend memory | 512MB | Container limit |
| Frontend memory | 128MB | Container limit |

## Failure Modes

### Backend Failure
```
Backend crashes
    │
    ▼
Docker restarts container (restart: unless-stopped)
    │
    ▼
SQLite database persists (mounted volume)
    │
    ▼
No data loss, service restored
```

### Frontend Failure
```
Frontend crashes
    │
    ▼
Docker restarts container
    │
    ▼
Static files still served (no state)
    │
    ▼
Service restored immediately
```

### Rate Limit Exceeded
```
Request rate exceeded
    │
    ▼
Return HTTP 429
    │
    ▼
Client waits (Retry-After header)
    │
    ▼
Request succeeds
```

### Authentication Failure
```
JWT token invalid/expired
    │
    ▼
Backend returns 401
    │
    ▼
Frontend clears localStorage
    │
    ▼
Redirect to login page
    │
    ▼
User re-authenticates
```

## Monitoring & Logging

### Backend Logs
```
- Server startup: "Server starting on port 3005"
- Database initialization: "Failed to initialize database"
- Rate limit exceeded: "Rate limit exceeded for IP X.X.X.X"
- Authentication failures: "Invalid password" / "Invalid token"
- Task limit reached: "Maximum task limit (100) reached"
```

### View Logs
```bash
# Backend logs
docker logs todo-backend

# Frontend logs (Nginx access/error)
docker logs todo-frontend

# Follow logs in real-time
docker logs -f todo-backend
```
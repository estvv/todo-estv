# Todo App

A self-hosted todo application with React frontend and Go backend.

## Features

- **Full-featured todos**: Title, description, priority, due dates, subtasks, and comments
- **Organization**: Projects and tags for categorization
- **Multiple views**: List, Kanban board, and Calendar views
- **Auto-save**: Changes are saved automatically
- **Clean design**: Minimalist white-on-neutral design system
- **Authentication**: Password-protected with JWT tokens
- **Security**: Rate limiting, task limits, Docker resource limits

## Quick Start

### 1. Create Environment File

```bash
cp .env.example .env
nano .env
```

Set these values:
- `AUTH_PASSWORD`: A strong password (at least 16 characters)
- `JWT_SECRET`: A random secret key (at least 32 characters)

Generate secure values:
```bash
openssl rand -base64 32   # For AUTH_PASSWORD
openssl rand -base64 64   # For JWT_SECRET
```

### 2. Start the Application

```bash
docker compose up -d
```

Access at: `http://localhost:3004`

### 3. Login

Use the password you set in `AUTH_PASSWORD` to log in.

## Tech Stack

- **Backend**: Go with SQLite database
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Authentication**: JWT tokens (7-day expiration)
- **Deployment**: Docker Compose

## Security Features

| Feature | Details |
|---------|---------|
| **Authentication** | Password-protected with JWT tokens |
| **Rate Limiting** | 5 login attempts/min, 100 general requests/min |
| **Task Limit** | Maximum 100 tasks (prevents database abuse) |
| **Resource Limits** | Docker memory/CPU limits |
| **Security Headers** | XSS protection, clickjacking prevention, HTTPS enforcement |

## Development

### Backend

```bash
cd backend
go mod tidy
AUTH_PASSWORD=dev JWT_SECRET=dev-secret go run main.go
```

The API will be available at `http://localhost:3005`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Data Storage

The app uses SQLite for data persistence. The database file is stored at:
- Docker: `/app/data/todo.db`
- Development: `./backend/data/todo.db`

## API Endpoints

### Authentication
- `POST /api/login` - Login with password, returns JWT token

### Todos
- `GET /api/todos` - List todos with filters (**requires auth**)
- `POST /api/todos` - Create todo (**requires auth**)
- `GET /api/todos/:id` - Get todo details (**requires auth**)
- `PUT /api/todos/:id` - Update todo (**requires auth**)
- `DELETE /api/todos/:id` - Delete todo (**requires auth**)

### Projects & Tags
- All endpoints require authentication

## Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `AUTH_PASSWORD` | Yes | - | Password for login |
| `JWT_SECRET` | Yes | - | Secret for JWT signing |
| `DB_PATH` | No | `./data/todo.db` | SQLite database path |
| `PORT` | No | `3005` | Backend server port |

## Rate Limits

| Endpoint | Limit | Purpose |
|----------|-------|---------|
| `/api/login` | 5 req/min | Brute force prevention |
| All other `/api/*` | 100 req/min | General API abuse prevention |

## Task Limits

- **Maximum 100 tasks per installation**
- Subtasks don't count toward limit
- Returns 403 Forbidden when limit reached

## Troubleshooting

### Can't login
1. Check `AUTH_PASSWORD` in `.env`
2. Check logs: `docker logs todo-backend`
3. Wait 1 minute after 5 failed attempts (rate limit)

### 401 Unauthorized
- Token expired (7-day expiration)
- Clear browser localStorage and login again

### 429 Too Many Requests
- Rate limit exceeded
- Wait 1 minute before retrying

### 403 Forbidden on create task
- Maximum 100 tasks reached
- Delete some tasks to free space

## File Structure

```
todo-estv/
├── backend/              # Go backend
│   ├── main.go          # Entry point
│   └── internal/
│       ├── handlers/    # HTTP handlers
│       ├── models/      # Data models
│       ├── database/    # SQLite operations
│       └── middleware/  # Auth, CORS, rate limiting
│
├── frontend/            # React frontend
│   └── src/
│       ├── components/   # React components
│       ├── hooks/       # Custom hooks
│       ├── utils/       # API & auth utilities
│       └── types/       # TypeScript types
│
├── docker-compose.yml   # Docker orchestration
├── Dockerfile.backend   # Backend Dockerfile
├── Dockerfile.frontend  # Frontend Dockerfile
├── .env.example         # Environment template
└── README-SECURITY.md   # Detailed security docs
```

## License

MIT

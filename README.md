# Todo App

A self-hosted todo application with React frontend and Go backend.

## Features

- **Full-featured todos**: Title, description, priority, due dates, subtasks, and comments
- **Organization**: Projects and tags for categorization
- **Multiple views**: List, Kanban board, and Calendar views
- **Auto-save**: Changes are saved automatically
- **Clean design**: Minimalist white-on-neutral design system

## Tech Stack

- **Backend**: Go with SQLite database
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Deployment**: Docker Compose

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Build and run
docker compose up -d

# Access the app
open http://localhost:3004
```

### Development

#### Backend

```bash
cd backend
go mod tidy
PORT=3005 go run main.go
```

The API will be available at `http://localhost:3005`

#### Frontend

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

## Architecture

```
todo-estv/
├── backend/              # Go backend
│   ├── main.go          # Entry point
│   ├── internal/
│   │   ├── handlers/    # HTTP handlers
│   │   ├── models/      # Data models
│   │   ├── database/    # SQLite operations
│   │   └── middleware/  # CORS middleware
│   └── data/            # SQLite database
│
├── frontend/            # React frontend
│   └── src/
│       ├── components/   # React components
│       ├── hooks/       # Custom hooks
│       ├── utils/       # API utilities
│       └── types/       # TypeScript types
│
├── docker-compose.yml   # Docker orchestration
├── Dockerfile.backend   # Backend Dockerfile
└── Dockerfile.frontend   # Frontend Dockerfile
```

## API Endpoints

### Todos
- `GET /api/todos` - List todos with filters
- `POST /api/todos` - Create todo
- `GET /api/todos/:id` - Get todo details
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo
- `GET /api/todos/:id/comments` - Get comments
- `POST /api/todos/:id/comments` - Add comment

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tags
- `GET /api/tags` - List tags
- `POST /api/tags` - Create tag
- `PUT /api/tags/:id` - Update tag
- `DELETE /api/tags/:id` - Delete tag

## Environment Variables

### Backend
- `DB_PATH`: Path to SQLite database file (default: `./data/todo.db`)
- `PORT`: Server port (default: `3005`)

### Frontend
- `VITE_API_URL`: Backend API URL (default: `http://localhost:3005/api`)

## Design System

The app follows a minimalist design with:
- Pure white background
- Neutral gray color palette
- Plus Jakarta Sans typography
- Colored accents for status and priority
- No shadows, subtle borders
- Clean transitions

## License

MIT
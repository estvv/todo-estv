# Todo App - Implementation Status

## Completed Features

### Core Functionality
- [x] Create, Read, Update, Delete (CRUD) todos
- [x] Todo properties: title, description, priority, due dates
- [x] Subtasks (nested todos with parent_id)
- [x] Comments on todos
- [x] Auto-save on changes

### Organization
- [x] Projects (folders for grouping todos)
- [x] Tags/Labels (categorize todos)
- [x] Priority levels (low, medium, high)
- [x] Due dates with visual indicators

### Views
- [x] List view (traditional vertical list)
- [x] Board view (Kanban by priority)
- [x] Calendar view (monthly calendar with due dates)

### User Interface
- [x] Clean minimalist design (white-on-neutral)
- [x] Plus Jakarta Sans typography
- [x] Responsive layout
- [x] Edit/Delete buttons on todo items
- [x] Modal overlays for creating/editing
- [x] Sidebar navigation (projects, tags)
- [x] View switcher (List/Board/Calendar)

### Authentication & Security
- [x] Password-protected login
- [x] JWT token authentication (7-day expiry)
- [x] Token stored in localStorage
- [x] Auto-redirect to login on invalid token

### Security Features
- [x] Rate limiting (5 login attempts/min, 100 API requests/min)
- [x] Maximum 100 tasks limit (prevents database abuse)
- [x] Docker resource limits (512MB backend, 128MB frontend)
- [x] Security headers (XSS, clickjacking, HTTPS enforcement)
- [x] Password stored in environment variable (not in code)

### Backend
- [x] Go HTTP server with Gorilla Mux
- [x] SQLite database
- [x] RESTful API endpoints
- [x] CORS middleware
- [x] JWT authentication middleware
- [x] Rate limiting middleware
- [x] Security headers middleware
- [x] Task limit enforcement

### Frontend
- [x] React 19 + TypeScript
- [x] Vite build system
- [x] Tailwind CSS v4
- [x] Modal components
- [x] Login page
- [x] Auth utilities

### Deployment
- [x] Docker multi-stage builds
- [x] Docker Compose orchestration
- [x] Environment variable configuration
- [x] Production-ready configuration

### High Priority
- [ ] Undo deleted tasks (soft delete)
- [ ] Export/import todos (JSON/CSV)
- [ ] Search functionality
- [ ] Sort by multiple fields
- [ ] Bulk operations (delete, move, tag)
- [ ] Due date reminders
- [ ] Task templates

### Medium Priority
- [ ] Recurring tasks
- [ ] Task dependencies (blocking)
- [ ] Archive completed tasks
- [ ] Themes (dark mode)
- [ ] Mobile app (PWA)
- [ ] Offline mode (IndexedDB)
- [ ] Real-time updates (WebSockets)

### Low Priority
- [ ] Multi-user support
- [ ] User roles/permissions
- [ ] Email notifications
- [ ] Integrations (calendar, Slack)
- [ ] API key authentication (alternative to password)
- [ ] Two-factor authentication
- [ ] Password reset (email)

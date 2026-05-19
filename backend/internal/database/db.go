package database

import (
	"database/sql"
	"time"

	"todo-estv/internal/models"

	_ "github.com/mattn/go-sqlite3"
)

type DB struct {
	*sql.DB
}

func Init(dbPath string) (*DB, error) {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		return nil, err
	}

	if err := createTables(db); err != nil {
		return nil, err
	}

	return &DB{db}, nil
}

func createTables(db *sql.DB) error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS projects (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			color TEXT DEFAULT '#22c55e',
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS tags (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL UNIQUE,
			color TEXT DEFAULT '#3b82f6',
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)`,
		`CREATE TABLE IF NOT EXISTS todos (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			description TEXT,
			completed INTEGER DEFAULT 0,
			priority TEXT DEFAULT 'medium',
			due_date DATETIME,
			project_id INTEGER,
			parent_id INTEGER,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (project_id) REFERENCES projects(id),
			FOREIGN KEY (parent_id) REFERENCES todos(id) ON DELETE CASCADE
		)`,
		`CREATE TABLE IF NOT EXISTS todo_tags (
			todo_id INTEGER,
			tag_id INTEGER,
			PRIMARY KEY (todo_id, tag_id),
			FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE,
			FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
		)`,
		`CREATE TABLE IF NOT EXISTS comments (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			todo_id INTEGER NOT NULL,
			content TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE
		)`,
		`CREATE INDEX IF NOT EXISTS idx_todos_project ON todos(project_id)`,
		`CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date)`,
		`CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed)`,
		`CREATE INDEX IF NOT EXISTS idx_todos_parent ON todos(parent_id)`,
	}

	for _, query := range queries {
		if _, err := db.Exec(query); err != nil {
			return err
		}
	}
	return nil
}

func (db *DB) GetTodos(filter models.TodoFilter) ([]models.Todo, error) {
	query := `SELECT id, title, description, completed, priority, due_date, project_id, parent_id, created_at, updated_at FROM todos WHERE 1=1`
	args := []interface{}{}

	if filter.ParentID != nil {
		if *filter.ParentID == 0 {
			query += ` AND parent_id IS NULL`
		} else {
			query += ` AND parent_id = ?`
			args = append(args, *filter.ParentID)
		}
	} else {
		query += ` AND parent_id IS NULL`
	}

	if filter.ProjectID != nil {
		query += ` AND project_id = ?`
		args = append(args, *filter.ProjectID)
	}

	if filter.Completed != nil {
		completed := 0
		if *filter.Completed {
			completed = 1
		}
		query += ` AND completed = ?`
		args = append(args, completed)
	}

	if filter.Priority != "" {
		query += ` AND priority = ?`
		args = append(args, filter.Priority)
	}

	if filter.DueBefore != nil {
		query += ` AND due_date <= ?`
		args = append(args, *filter.DueBefore)
	}

	if filter.DueAfter != nil {
		query += ` AND due_date >= ?`
		args = append(args, *filter.DueAfter)
	}

	if filter.TagID != nil {
		query += ` AND id IN (SELECT todo_id FROM todo_tags WHERE tag_id = ?)`
		args = append(args, *filter.TagID)
	}

	query += ` ORDER BY priority DESC, due_date ASC, created_at DESC`

	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	todos := []models.Todo{}
	for rows.Next() {
		var todo models.Todo
		var description sql.NullString
		var dueDate sql.NullTime
		var projectID sql.NullInt64
		var parentID sql.NullInt64

		err := rows.Scan(&todo.ID, &todo.Title, &description, &todo.Completed, &todo.Priority,
			&dueDate, &projectID, &parentID, &todo.CreatedAt, &todo.UpdatedAt)
		if err != nil {
			return nil, err
		}

		todo.Description = description.String
		if dueDate.Valid {
			todo.DueDate = &dueDate.Time
		}
		if projectID.Valid {
			todo.ProjectID = &projectID.Int64
		}
		if parentID.Valid {
			todo.ParentID = &parentID.Int64
		}

		todo.Tags, _ = db.GetTodoTags(todo.ID)
		todo.Subtasks, _ = db.GetSubtasks(todo.ID)

		todos = append(todos, todo)
	}

	return todos, nil
}

func (db *DB) GetTodo(id int64) (*models.Todo, error) {
	query := `SELECT id, title, description, completed, priority, due_date, project_id, parent_id, created_at, updated_at FROM todos WHERE id = ?`

	var todo models.Todo
	var description sql.NullString
	var dueDate sql.NullTime
	var projectID sql.NullInt64
	var parentID sql.NullInt64

	err := db.QueryRow(query, id).Scan(&todo.ID, &todo.Title, &description, &todo.Completed, &todo.Priority,
		&dueDate, &projectID, &parentID, &todo.CreatedAt, &todo.UpdatedAt)
	if err != nil {
		return nil, err
	}

	todo.Description = description.String
	if dueDate.Valid {
		todo.DueDate = &dueDate.Time
	}
	if projectID.Valid {
		todo.ProjectID = &projectID.Int64
	}
	if parentID.Valid {
		todo.ParentID = &parentID.Int64
	}

	todo.Tags, _ = db.GetTodoTags(todo.ID)
	todo.Subtasks, _ = db.GetSubtasks(todo.ID)
	todo.Comments, _ = db.GetComments(todo.ID)

	if todo.ProjectID != nil {
		todo.Project, _ = db.GetProject(*todo.ProjectID)
	}

	return &todo, nil
}

func (db *DB) CreateTodo(todo *models.Todo) error {
	query := `INSERT INTO todos (title, description, completed, priority, due_date, project_id, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?)`
	result, err := db.Exec(query, todo.Title, todo.Description, todo.Completed, todo.Priority, todo.DueDate, todo.ProjectID, todo.ParentID)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	todo.ID = id

	for _, tag := range todo.Tags {
		db.AddTagToTodo(id, tag.ID)
	}

	todo.CreatedAt = time.Now()
	todo.UpdatedAt = time.Now()

	return nil
}

func (db *DB) UpdateTodo(todo *models.Todo) error {
	query := `UPDATE todos SET title = ?, description = ?, completed = ?, priority = ?, due_date = ?, project_id = ?, parent_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`

	_, err := db.Exec(query, todo.Title, todo.Description, todo.Completed, todo.Priority, todo.DueDate, todo.ProjectID, todo.ParentID, todo.ID)
	if err != nil {
		return err
	}

	db.ClearTodoTags(todo.ID)
	for _, tag := range todo.Tags {
		db.AddTagToTodo(todo.ID, tag.ID)
	}

	todo.UpdatedAt = time.Now()

	return nil
}

func (db *DB) DeleteTodo(id int64) error {
	_, err := db.Exec(`DELETE FROM todos WHERE id = ?`, id)
	return err
}

func (db *DB) GetSubtasks(todoID int64) ([]models.Todo, error) {
	query := `SELECT id, title, description, completed, priority, due_date, project_id, created_at, updated_at FROM todos WHERE parent_id = ? ORDER BY priority DESC, created_at ASC`

	rows, err := db.Query(query, todoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	subtasks := []models.Todo{}
	for rows.Next() {
		var todo models.Todo
		var description sql.NullString
		var dueDate sql.NullTime
		var projectID sql.NullInt64

		err := rows.Scan(&todo.ID, &todo.Title, &description, &todo.Completed, &todo.Priority,
			&dueDate, &projectID, &todo.CreatedAt, &todo.UpdatedAt)
		if err != nil {
			return nil, err
		}

		todo.Description = description.String
		if dueDate.Valid {
			todo.DueDate = &dueDate.Time
		}
		if projectID.Valid {
			todo.ProjectID = &projectID.Int64
		}

		subtasks = append(subtasks, todo)
	}

	return subtasks, nil
}

func (db *DB) GetTodoTags(todoID int64) ([]models.Tag, error) {
	query := `SELECT t.id, t.name, t.color, t.created_at FROM tags t INNER JOIN todo_tags tt ON t.id = tt.tag_id WHERE tt.todo_id = ?`

	rows, err := db.Query(query, todoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tags := []models.Tag{}
	for rows.Next() {
		var tag models.Tag
		err := rows.Scan(&tag.ID, &tag.Name, &tag.Color, &tag.CreatedAt)
		if err != nil {
			return nil, err
		}
		tags = append(tags, tag)
	}

	return tags, nil
}

func (db *DB) AddTagToTodo(todoID, tagID int64) error {
	_, err := db.Exec(`INSERT OR IGNORE INTO todo_tags (todo_id, tag_id) VALUES (?, ?)`, todoID, tagID)
	return err
}

func (db *DB) ClearTodoTags(todoID int64) error {
	_, err := db.Exec(`DELETE FROM todo_tags WHERE todo_id = ?`, todoID)
	return err
}

func (db *DB) GetComments(todoID int64) ([]models.Comment, error) {
	query := `SELECT id, todo_id, content, created_at FROM comments WHERE todo_id = ? ORDER BY created_at ASC`

	rows, err := db.Query(query, todoID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	comments := []models.Comment{}
	for rows.Next() {
		var comment models.Comment
		err := rows.Scan(&comment.ID, &comment.TodoID, &comment.Content, &comment.CreatedAt)
		if err != nil {
			return nil, err
		}
		comments = append(comments, comment)
	}

	return comments, nil
}

func (db *DB) CreateComment(comment *models.Comment) error {
	query := `INSERT INTO comments (todo_id, content) VALUES (?, ?)`
	result, err := db.Exec(query, comment.TodoID, comment.Content)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	comment.ID = id
	comment.CreatedAt = time.Now()

	return nil
}

func (db *DB) DeleteComment(id int64) error {
	_, err := db.Exec(`DELETE FROM comments WHERE id = ?`, id)
	return err
}

func (db *DB) GetProjects() ([]models.Project, error) {
	query := `SELECT id, name, color, created_at, updated_at FROM projects ORDER BY name ASC`

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	projects := []models.Project{}
	for rows.Next() {
		var project models.Project
		err := rows.Scan(&project.ID, &project.Name, &project.Color, &project.CreatedAt, &project.UpdatedAt)
		if err != nil {
			return nil, err
		}
		projects = append(projects, project)
	}

	return projects, nil
}

func (db *DB) GetProject(id int64) (*models.Project, error) {
	query := `SELECT id, name, color, created_at, updated_at FROM projects WHERE id = ?`

	var project models.Project
	err := db.QueryRow(query, id).Scan(&project.ID, &project.Name, &project.Color, &project.CreatedAt, &project.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &project, nil
}

func (db *DB) CreateProject(project *models.Project) error {
	query := `INSERT INTO projects (name, color) VALUES (?, ?)`
	result, err := db.Exec(query, project.Name, project.Color)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	project.ID = id
	project.CreatedAt = time.Now()
	project.UpdatedAt = time.Now()

	return nil
}

func (db *DB) UpdateProject(project *models.Project) error {
	query := `UPDATE projects SET name = ?, color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`

	_, err := db.Exec(query, project.Name, project.Color, project.ID)
	if err != nil {
		return err
	}

	project.UpdatedAt = time.Now()

	return nil
}

func (db *DB) DeleteProject(id int64) error {
	_, err := db.Exec(`DELETE FROM projects WHERE id = ?`, id)
	return err
}

func (db *DB) GetTags() ([]models.Tag, error) {
	query := `SELECT id, name, color, created_at FROM tags ORDER BY name ASC`

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tags := []models.Tag{}
	for rows.Next() {
		var tag models.Tag
		err := rows.Scan(&tag.ID, &tag.Name, &tag.Color, &tag.CreatedAt)
		if err != nil {
			return nil, err
		}
		tags = append(tags, tag)
	}

	return tags, nil
}

func (db *DB) CreateTag(tag *models.Tag) error {
	query := `INSERT INTO tags (name, color) VALUES (?, ?)`
	result, err := db.Exec(query, tag.Name, tag.Color)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}
	tag.ID = id
	tag.CreatedAt = time.Now()

	return nil
}

func (db *DB) UpdateTag(tag *models.Tag) error {
	query := `UPDATE tags SET name = ?, color = ? WHERE id = ?`

	_, err := db.Exec(query, tag.Name, tag.Color, tag.ID)
	return err
}

func (db *DB) DeleteTag(id int64) error {
	_, err := db.Exec(`DELETE FROM tags WHERE id = ?`, id)
	return err
}

func (db *DB) GetTodoCount() (int, error) {
	var count int
	err := db.QueryRow(`SELECT COUNT(*) FROM todos WHERE parent_id IS NULL`).Scan(&count)
	return count, err
}
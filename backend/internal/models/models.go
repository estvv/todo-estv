package models

import "time"

type Project struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Color     string    `json:"color"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Tag struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Color     string    `json:"color"`
	CreatedAt time.Time `json:"created_at"`
}

type Todo struct {
	ID          int64      `json:"id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Completed   bool       `json:"completed"`
	Priority    string     `json:"priority"`
	DueDate     *time.Time `json:"due_date,omitempty"`
	ProjectID   *int64     `json:"project_id,omitempty"`
	ParentID    *int64     `json:"parent_id,omitempty"`
	Project     *Project   `json:"project,omitempty"`
	Tags        []Tag      `json:"tags,omitempty"`
	Subtasks    []Todo     `json:"subtasks,omitempty"`
	Comments    []Comment  `json:"comments,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type Comment struct {
	ID        int64     `json:"id"`
	TodoID    int64     `json:"todo_id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

type TodoFilter struct {
	ProjectID *int64
	TagID     *int64
	Completed *bool
	Priority  string
	DueBefore *time.Time
	DueAfter  *time.Time
	ParentID  *int64
}
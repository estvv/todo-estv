package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"todo-estv/internal/database"
	"todo-estv/internal/models"

	"github.com/gorilla/mux"
)

type TodoHandler struct {
	DB *database.DB
}

type TodoResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

func (h *TodoHandler) List(w http.ResponseWriter, r *http.Request) {
	filter := models.TodoFilter{}

	if projectID := r.URL.Query().Get("project_id"); projectID != "" {
		if id, err := strconv.ParseInt(projectID, 10, 64); err == nil {
			filter.ProjectID = &id
		}
	}

	if tagID := r.URL.Query().Get("tag_id"); tagID != "" {
		if id, err := strconv.ParseInt(tagID, 10, 64); err == nil {
			filter.TagID = &id
		}
	}

	if completed := r.URL.Query().Get("completed"); completed != "" {
		val := completed == "true"
		filter.Completed = &val
	}

	if priority := r.URL.Query().Get("priority"); priority != "" {
		filter.Priority = priority
	}

	if dueBefore := r.URL.Query().Get("due_before"); dueBefore != "" {
		if t, err := parseTime(dueBefore); err == nil {
			filter.DueBefore = &t
		}
	}

	if dueAfter := r.URL.Query().Get("due_after"); dueAfter != "" {
		if t, err := parseTime(dueAfter); err == nil {
			filter.DueAfter = &t
		}
	}

	if parentID := r.URL.Query().Get("parent_id"); parentID != "" {
		if id, err := strconv.ParseInt(parentID, 10, 64); err == nil {
			filter.ParentID = &id
		}
	}

	todos, err := h.DB.GetTodos(filter)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, todos)
}

func (h *TodoHandler) Get(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid todo ID")
		return
	}

	todo, err := h.DB.GetTodo(id)
	if err != nil {
		respondError(w, http.StatusNotFound, "Todo not found")
		return
	}

	respondJSON(w, todo)
}

func (h *TodoHandler) Create(w http.ResponseWriter, r *http.Request) {
	var todo models.Todo
	if err := json.NewDecoder(r.Body).Decode(&todo); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if todo.Title == "" {
		respondError(w, http.StatusBadRequest, "Title is required")
		return
	}

	if todo.Priority == "" {
		todo.Priority = "medium"
	}

	if err := h.DB.CreateTodo(&todo); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, todo)
}

func (h *TodoHandler) Update(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid todo ID")
		return
	}

	var todo models.Todo
	if err := json.NewDecoder(r.Body).Decode(&todo); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	todo.ID = id

	if err := h.DB.UpdateTodo(&todo); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	updated, err := h.DB.GetTodo(id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, updated)
}

func (h *TodoHandler) Delete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid todo ID")
		return
	}

	if err := h.DB.DeleteTodo(id); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, map[string]bool{"deleted": true})
}

func (h *TodoHandler) GetComments(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	todoID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid todo ID")
		return
	}

	comments, err := h.DB.GetComments(todoID)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, comments)
}

func (h *TodoHandler) CreateComment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	todoID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid todo ID")
		return
	}

	var comment models.Comment
	if err := json.NewDecoder(r.Body).Decode(&comment); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	comment.TodoID = todoID

	if comment.Content == "" {
		respondError(w, http.StatusBadRequest, "Content is required")
		return
	}

	if err := h.DB.CreateComment(&comment); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, comment)
}

func (h *TodoHandler) DeleteComment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid comment ID")
		return
	}

	if err := h.DB.DeleteComment(id); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, map[string]bool{"deleted": true})
}
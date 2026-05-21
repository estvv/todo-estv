package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"todo-estv/internal/database"
	"todo-estv/internal/models"

	"github.com/gorilla/mux"
)

type ProjectHandler struct {
	DB *database.DB
}

func (h *ProjectHandler) List(w http.ResponseWriter, r *http.Request) {
	projects, err := h.DB.GetProjects()
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, projects)
}

func (h *ProjectHandler) Get(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid project ID")
		return
	}

	project, err := h.DB.GetProject(id)
	if err != nil {
		respondError(w, http.StatusNotFound, "Project not found")
		return
	}

	respondJSON(w, project)
}

func (h *ProjectHandler) Create(w http.ResponseWriter, r *http.Request) {
	var project models.Project
	if err := json.NewDecoder(r.Body).Decode(&project); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if project.Name == "" {
		respondError(w, http.StatusBadRequest, "Name is required")
		return
	}

	if project.Color == "" {
		project.Color = "#22c55e"
	}

	if err := h.DB.CreateProject(&project); err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to create project")
		return
	}

	respondJSON(w, project)
}

func (h *ProjectHandler) Update(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid project ID")
		return
	}

	var project models.Project
	if err := json.NewDecoder(r.Body).Decode(&project); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	project.ID = id

	if err := h.DB.UpdateProject(&project); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	updated, err := h.DB.GetProject(id)
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, updated)
}

func (h *ProjectHandler) Delete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid project ID")
		return
	}

	if err := h.DB.DeleteProject(id); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, map[string]bool{"deleted": true})
}
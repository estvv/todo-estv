package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"todo-estv/internal/database"
	"todo-estv/internal/models"

	"github.com/gorilla/mux"
)

type TagHandler struct {
	DB *database.DB
}

func (h *TagHandler) List(w http.ResponseWriter, r *http.Request) {
	tags, err := h.DB.GetTags()
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, tags)
}

func (h *TagHandler) Create(w http.ResponseWriter, r *http.Request) {
	var tag models.Tag
	if err := json.NewDecoder(r.Body).Decode(&tag); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if tag.Name == "" {
		respondError(w, http.StatusBadRequest, "Name is required")
		return
	}

	if tag.Color == "" {
		tag.Color = "#3b82f6"
	}

	if err := h.DB.CreateTag(&tag); err != nil {
		// Check for unique constraint violation
		if strings.Contains(err.Error(), "UNIQUE constraint failed: tags.name") {
			respondError(w, http.StatusConflict, "Tag with this name already exists")
			return
		}
		respondError(w, http.StatusInternalServerError, "Failed to create tag")
		return
	}

	respondJSON(w, tag)
}

func (h *TagHandler) Update(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid tag ID")
		return
	}

	var tag models.Tag
	if err := json.NewDecoder(r.Body).Decode(&tag); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	tag.ID = id

	if err := h.DB.UpdateTag(&tag); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, tag)
}

func (h *TagHandler) Delete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		respondError(w, http.StatusBadRequest, "Invalid tag ID")
		return
	}

	if err := h.DB.DeleteTag(id); err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}

	respondJSON(w, map[string]bool{"deleted": true})
}
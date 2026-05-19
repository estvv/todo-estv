package handlers

import (
	"encoding/json"
	"net/http"
	"os"

	"todo-estv/internal/middleware"
)

type AuthHandler struct{}

type LoginRequest struct {
	Password string `json:"password"`
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	authPassword := os.Getenv("AUTH_PASSWORD")
	if authPassword == "" {
		authPassword = "changeme"
	}

	if req.Password != authPassword {
		respondError(w, http.StatusUnauthorized, "Invalid password")
		return
	}

	token, err := middleware.GenerateToken("user")
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	respondJSON(w, map[string]string{"token": token})
}
package main

import (
	"log"
	"net/http"
	"os"

	"todo-estv/internal/database"
	"todo-estv/internal/handlers"
	"todo-estv/internal/middleware"

	"github.com/gorilla/mux"
)

func main() {
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "./data/todo.db"
	}

	db, err := database.Init(dbPath)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	// Initialize rate limiters
	middleware.InitRateLimiters()

	r := mux.NewRouter()

	// Apply security headers globally
	r.Use(middleware.SecurityHeaders)

	// Auth handler
	authHandler := &handlers.AuthHandler{}
	todoHandler := &handlers.TodoHandler{DB: db}
	projectHandler := &handlers.ProjectHandler{DB: db}
	tagHandler := &handlers.TagHandler{DB: db}

	// API routes
	api := r.PathPrefix("/api").Subrouter()
	api.Use(middleware.CORS)
	api.Use(middleware.RateLimit)

	// Public routes (no auth required)
	api.HandleFunc("/login", authHandler.Login).Methods("POST")
	api.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	}).Methods("GET")

	// Protected routes (require auth)
	protected := api.PathPrefix("").Subrouter()
	protected.Use(middleware.Auth)

	protected.HandleFunc("/todos", todoHandler.List).Methods("GET")
	protected.HandleFunc("/todos", todoHandler.Create).Methods("POST")
	protected.HandleFunc("/todos/{id}", todoHandler.Get).Methods("GET")
	protected.HandleFunc("/todos/{id}", todoHandler.Update).Methods("PUT")
	protected.HandleFunc("/todos/{id}", todoHandler.Delete).Methods("DELETE")
	protected.HandleFunc("/todos/{id}/comments", todoHandler.GetComments).Methods("GET")
	protected.HandleFunc("/todos/{id}/comments", todoHandler.CreateComment).Methods("POST")
	protected.HandleFunc("/comments/{id}", todoHandler.DeleteComment).Methods("DELETE")

	protected.HandleFunc("/projects", projectHandler.List).Methods("GET")
	protected.HandleFunc("/projects", projectHandler.Create).Methods("POST")
	protected.HandleFunc("/projects/{id}", projectHandler.Get).Methods("GET")
	protected.HandleFunc("/projects/{id}", projectHandler.Update).Methods("PUT")
	protected.HandleFunc("/projects/{id}", projectHandler.Delete).Methods("DELETE")

	protected.HandleFunc("/tags", tagHandler.List).Methods("GET")
	protected.HandleFunc("/tags", tagHandler.Create).Methods("POST")
	protected.HandleFunc("/tags/{id}", tagHandler.Update).Methods("PUT")
	protected.HandleFunc("/tags/{id}", tagHandler.Delete).Methods("DELETE")

	port := os.Getenv("PORT")
	if port == "" {
		port = "3005"
	}

	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
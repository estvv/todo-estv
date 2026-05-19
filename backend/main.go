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

	r := mux.NewRouter()

	todoHandler := &handlers.TodoHandler{DB: db}
	projectHandler := &handlers.ProjectHandler{DB: db}
	tagHandler := &handlers.TagHandler{DB: db}

	api := r.PathPrefix("/api").Subrouter()

	api.HandleFunc("/todos", todoHandler.List).Methods("GET")
	api.HandleFunc("/todos", todoHandler.Create).Methods("POST")
	api.HandleFunc("/todos/{id}", todoHandler.Get).Methods("GET")
	api.HandleFunc("/todos/{id}", todoHandler.Update).Methods("PUT")
	api.HandleFunc("/todos/{id}", todoHandler.Delete).Methods("DELETE")
	api.HandleFunc("/todos/{id}/comments", todoHandler.GetComments).Methods("GET")
	api.HandleFunc("/todos/{id}/comments", todoHandler.CreateComment).Methods("POST")
	api.HandleFunc("/comments/{id}", todoHandler.DeleteComment).Methods("DELETE")

	api.HandleFunc("/projects", projectHandler.List).Methods("GET")
	api.HandleFunc("/projects", projectHandler.Create).Methods("POST")
	api.HandleFunc("/projects/{id}", projectHandler.Get).Methods("GET")
	api.HandleFunc("/projects/{id}", projectHandler.Update).Methods("PUT")
	api.HandleFunc("/projects/{id}", projectHandler.Delete).Methods("DELETE")

	api.HandleFunc("/tags", tagHandler.List).Methods("GET")
	api.HandleFunc("/tags", tagHandler.Create).Methods("POST")
	api.HandleFunc("/tags/{id}", tagHandler.Update).Methods("PUT")
	api.HandleFunc("/tags/{id}", tagHandler.Delete).Methods("DELETE")

	r.Use(middleware.CORS)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3005"
	}

	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
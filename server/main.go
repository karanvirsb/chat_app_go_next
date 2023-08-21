package main

import (
	"chat_app_server/data"
	"chat_app_server/handler"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

var connections = data.Connections{
	Conns: []*data.Socket{},
}

var rooms = map[string]data.Room{}

func main() {
	router := mux.NewRouter()

	c := cors.New(cors.Options{
		AllowedOrigins:   handler.AllowedOrigins,
		AllowCredentials: true,
		// Enable Debugging for testing, consider disabling in production
		Debug: true,
	})

	router.HandleFunc("/socket", func(w http.ResponseWriter, r *http.Request) {
		handler.SocketHandler(&connections, &rooms, w, r)
	})
	router.HandleFunc("/users", func(w http.ResponseWriter, r *http.Request) {
		handler.UsersRequestHandler(w, r, &connections)
	})
	router.HandleFunc("/check/username", func(w http.ResponseWriter, r *http.Request) {
		handler.CheckUsernameRequestHandler(w, r, &connections)
	}).Methods("POST")

	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Server request")
	})

	handler := c.Handler(router)
	http.ListenAndServe(":8000", handler)
}

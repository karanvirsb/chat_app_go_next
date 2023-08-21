package main

import (
	"chat_app_server/handler"
	"chat_app_server/websockets"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

var connections = websockets.Connections{
	Conns: []*websockets.Socket{},
}

var rooms = map[string]websockets.Room{}

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
	router.HandleFunc("/check/username", checkUsernameRequestHandler).Methods("POST")

	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Server request")
	})

	handler := c.Handler(router)
	http.ListenAndServe(":8000", handler)
}

func checkUsernameRequestHandler(w http.ResponseWriter, r *http.Request) {
	type MessageResponse struct {
		Success bool   `json:"success"`
		Error   string `json:"error,omitempty"`
	}
	type RequestBody struct {
		Username string `json:"username"`
	}
	var b RequestBody
	err := json.NewDecoder(r.Body).Decode(&b)
	if err != nil {
		fmt.Printf("Error checking name %v\n", err)
		json.NewEncoder(w).Encode(MessageResponse{Success: false, Error: "Server Error: Bad Request"})
		return
	}

	foundUsername := false

	for _, conn := range connections.Conns {
		if conn.Username == b.Username {
			foundUsername = true
			break
		}
	}

	if foundUsername {
		w.WriteHeader(http.StatusAccepted)

		json.NewEncoder(w).Encode(MessageResponse{Success: false, Error: "Username already exists"})
		return
	} else {
		json.NewEncoder(w).Encode(MessageResponse{Success: true})
	}
}

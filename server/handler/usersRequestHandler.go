package handler

import (
	"chat_app_server/data"
	"encoding/json"
	"net/http"
)

type User struct {
	Username string `json:"username"`
	Id       string `json:"id"`
}

func UsersRequestHandler(w http.ResponseWriter, r *http.Request, connections *data.Connections) {
	usersRequestHandler(w, r, connections)
}

func usersRequestHandler(w http.ResponseWriter, r *http.Request, connections *data.Connections) {
	users := make([]User, len(connections.Conns))
	for i, conn := range connections.Conns {
		if len(conn.Username) == 0 {
			continue
		}
		users[i] = User{Username: conn.Username, Id: conn.Id}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(users)
}

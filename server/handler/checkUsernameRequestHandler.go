package handler

import (
	"chat_app_server/websockets"
	"encoding/json"
	"fmt"
	"net/http"
)

type MessageResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error,omitempty"`
}
type RequestBody struct {
	Username string `json:"username"`
}

func CheckUsernameRequestHandler(w http.ResponseWriter, r *http.Request, connections *websockets.Connections) {
	checkUsernameRequestHandler(w, r, connections)
}

func checkUsernameRequestHandler(w http.ResponseWriter, r *http.Request, connections *websockets.Connections) {
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

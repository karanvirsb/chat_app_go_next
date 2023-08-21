package main

import (
	"chat_app_server/websockets"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/rs/cors"
)

var allowedOrigins []string = []string{"http://localhost:3000", "*"}

var upgrader = websocket.Upgrader{
	EnableCompression: true,
	CheckOrigin: func(r *http.Request) bool {
		found := false
		origin := r.Header.Get("Origin")

		for _, o := range allowedOrigins {
			if o == origin {
				found = true
				break
			}
			if o == "*" {
				found = true
				break
			}
		}

		return found
	},
}

func generateId() string {
	return uuid.NewString()
}

var connections = websockets.Connections{
	Conns: []*websockets.Socket{},
}

var rooms = map[string]websockets.Room{}

type User struct {
	Username string `json:"username"`
	Id       string `json:"id"`
}

func main() {
	router := mux.NewRouter()

	c := cors.New(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowCredentials: true,
		// Enable Debugging for testing, consider disabling in production
		Debug: true,
	})

	router.HandleFunc("/socket", socketHandler)
	router.HandleFunc("/users", usersRequestHandler)
	router.HandleFunc("/check/username", checkUsernameRequestHandler).Methods("POST")

	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Server request")
	})

	handler := c.Handler(router)
	http.ListenAndServe(":8000", handler)
}
func socketHandler(w http.ResponseWriter, r *http.Request) {
	wg := sync.WaitGroup{}
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Printf("Error web socket: %v", err)
	}
	defer func() {
		conn.Close()
		fmt.Println("****Connection closed***")
	}()
	// var vars = mux.Vars(r)
	// room := vars["room"]

	// creating socket
	socket := websockets.Socket{
		Id:   generateId(),
		Conn: conn,
	}

	connections.AddConnection(&socket)
	fmt.Printf("socket connected: %v\n", socket.Conn.RemoteAddr())
	wg.Add(1)
	go func() {
		defer wg.Done()
		websockets.CaptureSocketEvents(&socket, &connections, &rooms)
	}()
	wg.Wait()

}

func usersRequestHandler(w http.ResponseWriter, r *http.Request) {
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

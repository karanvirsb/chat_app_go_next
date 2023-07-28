package main

import (
	"chat_app_server/websockets"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

var allowedOrigins []string = []string{"http://localhost:3000"}

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		found := false
		origin := r.Header.Get("Origin")

		for _, o := range allowedOrigins {
			if o == origin {
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
	Conns: []websockets.Socket{},
}

func main() {

	router := mux.NewRouter()

	router.HandleFunc("/socket/{room}", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			fmt.Printf("Error web socket: %v", err)
		}
		var vars = mux.Vars(r)

		// creating socket
		socket := websockets.Socket{
			Id:    generateId(),
			Rooms: []string{vars["room"]},
			Conn:  conn,
		}

		connections.AddConnection(socket)
		fmt.Printf("socket connected: %v", socket.Conn.RemoteAddr())
		websockets.CaptureSocketEvents(&socket, &connections)
	})
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Server request")
	})
	http.ListenAndServe(":8000", router)
}

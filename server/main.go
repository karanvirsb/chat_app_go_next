package main

import (
	"chat_app_server/socketEvents"
	"fmt"
	"net/http"

	"github.com/google/uuid"
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

var connections = socketEvents.Connections{
	Conns: []socketEvents.Socket{},
}

func main() {

	http.HandleFunc("/socket", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			fmt.Printf("Error web socket: %v", err)
		}
		// creating socket
		socket := socketEvents.Socket{
			Id:    generateId(),
			Rooms: []string{"1"},
			Conn:  conn,
		}

		connections.AddConnection(socket)
		fmt.Printf("socket connected: %v", socket.Conn.RemoteAddr())
		socketEvents.CaptureSocketEvents(&socket, &connections)
	})
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Server request")
	})
	http.ListenAndServe(":8000", nil)
}

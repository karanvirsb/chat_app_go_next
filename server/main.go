package main

import (
	"chat_app_server/socketEvents"
	"fmt"
	"net/http"
	"sync"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type Connections struct {
	mu    sync.Mutex
	conns []socketEvents.Socket
}

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

func (c *Connections) addConnection(conn socketEvents.Socket) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.conns = append(c.conns, conn)
}

func generateId() string {
	return uuid.NewString()
}

var connections = Connections{
	conns: []socketEvents.Socket{},
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

		connections.addConnection(socket)
		fmt.Printf("socket connected: %v", socket.Conn.RemoteAddr())
		socketEvents.CaptureSocketEvents(socket, connections)
	})
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Server request")
	})
	http.ListenAndServe(":8000", nil)
}

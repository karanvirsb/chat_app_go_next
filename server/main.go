package main

import (
	"chat_app_server/socketEvents"
	"fmt"
	"net/http"
	"sync"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type Message[T any] struct {
	Data      T        `json:"data,omitempty"`
	EventName string   `json:"eventName,omitempty"`
	Room      []string `json:"room,omitempty"`
}

type Socket struct {
	id    string
	rooms []string
	conn  *websocket.Conn
}

type Connections struct {
	mu    sync.Mutex
	conns []Socket
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

func (c *Connections) addConnection(conn Socket) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.conns = append(c.conns, conn)
}

func (socket *Socket) addRooms(rooms []string) {
	socket.rooms = append(socket.rooms, rooms...)
}

func generateId() string {
	return uuid.NewString()
}

var connections = Connections{
	conns: []Socket{},
}

func main() {

	http.HandleFunc("/socket", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			fmt.Printf("Error web socket: %v", err)
		}
		// creating socket
		socket := Socket{
			id:    generateId(),
			rooms: []string{"1"},
			conn:  conn,
		}

		connections.addConnection(socket)
		fmt.Printf("socket connected: %v", socket.conn.RemoteAddr())
		socketEvents.CaptureSocketEvents(socket)
	})
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Server request")
	})
	http.ListenAndServe(":8000", nil)
}

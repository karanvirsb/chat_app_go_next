package handler

import (
	"chat_app_server/websockets"
	"fmt"
	"net/http"
	"sync"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var AllowedOrigins []string = []string{"http://localhost:3000", "*"}

var upgrader = websocket.Upgrader{
	EnableCompression: true,
	CheckOrigin: func(r *http.Request) bool {
		found := false
		origin := r.Header.Get("Origin")

		for _, o := range AllowedOrigins {
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
func SocketHandler(connections *websockets.Connections, rooms *map[string]websockets.Room, w http.ResponseWriter, r *http.Request) {
	socketRequestHandler(w, r, connections, rooms)
}
func socketRequestHandler(w http.ResponseWriter, r *http.Request, connections *websockets.Connections, rooms *map[string]websockets.Room) {
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
		websockets.CaptureSocketEvents(&socket, connections, rooms)
	}()
	wg.Wait()

}

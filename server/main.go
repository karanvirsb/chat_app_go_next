package main

import (
	"fmt"
	"net/http"
	"sync"

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

type Socket struct {
	id    string
	rooms []string
	conn  *websocket.Conn
}

type Connections struct {
	mu    sync.Mutex
	conns []Socket
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

func main() {
	connections := Connections{
		conns: []Socket{},
	}
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

		go connections.addConnection(socket)
		fmt.Printf("socket connected: %v", conn.RemoteAddr())

		for {
			msgType, msg, err := conn.ReadMessage()

			if err != nil {
				return
			}

			fmt.Printf("%v -- sent message: %v\n", conn.RemoteAddr(), string(msg))
			for _, con := range connections.conns {
				err = con.conn.WriteMessage(msgType, msg)
				if err != nil {
					fmt.Printf("Error while sending message: %v", err)
				}
			}
			// Write message back to browser
			// if err = conn.WriteMessage(msgType, msg); err != nil {
			// 	return
			// }
		}
	})
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Server request")
	})
	http.ListenAndServe(":8000", nil)
}

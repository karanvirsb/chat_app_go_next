package main

import (
	"fmt"
	"net/http"
	"sync"

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
	conns []*websocket.Conn
}

func (c *Connections) addConnection(conn *websocket.Conn) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.conns = append(c.conns, conn)
}

func main() {
	connections := Connections{
		conns: []*websocket.Conn{},
	}
	http.HandleFunc("/socket", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			fmt.Printf("Error web socket: %v", err)
		}
		go connections.addConnection(conn)
		fmt.Printf("socket connected: %v", conn.RemoteAddr())

		for {
			msgType, msg, err := conn.ReadMessage()

			if err != nil {
				return
			}

			fmt.Printf("%v -- sent message: %v\n", conn.RemoteAddr(), string(msg))
			for _, con := range connections.conns {
				err = con.WriteMessage(msgType, msg)
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

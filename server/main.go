package main

import (
	"chat_app_server/websockets"
	"fmt"
	"net/http"
	"sync"

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

var rooms = map[string]websockets.Room{}

func main() {

	router := mux.NewRouter()

	router.HandleFunc("/socket", func(w http.ResponseWriter, r *http.Request) {
		wg := sync.WaitGroup{}
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			fmt.Printf("Error web socket: %v", err)
		}
		defer conn.Close()
		// var vars = mux.Vars(r)
		// room := vars["room"]

		// creating socket
		socket := websockets.Socket{
			Id:   generateId(),
			Conn: conn,
		}

		connections.AddConnection(socket)
		fmt.Printf("socket connected: %v\n", socket.Conn.RemoteAddr())
		wg.Add(1)
		go websockets.CaptureSocketEvents(&socket, &connections, &rooms)
		wg.Wait()
		defer wg.Done()

		fmt.Println("Connection closed")
	})
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Server request")
	})
	http.ListenAndServe(":8000", router)
}

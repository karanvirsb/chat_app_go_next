package websockets

import (
	"encoding/json"
	"fmt"
	"sync"

	"github.com/gorilla/websocket"
)

type Message[T any] struct {
	Data      T        `json:"data,omitempty"`
	EventName string   `json:"eventName,omitempty"`
	Room      []string `json:"room,omitempty"`
}

type Socket struct {
	Id    string
	Rooms []string
	Conn  *websocket.Conn
}

type Connections struct {
	Mu    sync.Mutex
	Conns []Socket
}

func (socket *Socket) AddRooms(rooms []string) {
	socket.Rooms = append(socket.Rooms, rooms...)
}
func (c *Connections) AddConnection(conn Socket) {
	c.Mu.Lock()
	defer c.Mu.Unlock()
	c.Conns = append(c.Conns, conn)
}

func CaptureSocketEvents(socket *Socket, Connections *Connections) {

	for {

		jsonMessage := Message[any]{}
		err := socket.Conn.ReadJSON(&jsonMessage)

		if err != nil {
			fmt.Printf("\nJson Message Error: %v\n", err)
			continue
		}

		msg, _ := json.Marshal(jsonMessage)
		fmt.Printf("\nJSON message: %v\n", string(msg))

		for _, socket := range Connections.Conns {
			err := socket.Conn.WriteJSON(string(msg))
			if err != nil {
				fmt.Printf("\nError while sending message: %v\n", err)
				continue
			}
		}
	}
}

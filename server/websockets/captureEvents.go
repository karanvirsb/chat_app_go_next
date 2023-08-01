package websockets

import (
	"encoding/json"
	"fmt"
	"strings"
	"sync"

	"github.com/gorilla/websocket"
)

type Message struct {
	Data      any    `json:"data,omitempty"`
	EventName string `json:"eventName,omitempty"`
	Room      string `json:"room,omitempty"`
}

type Socket struct {
	Id   string
	Conn *websocket.Conn
}

type Connections struct {
	Mu    sync.Mutex
	Conns []Socket
}

func (c *Connections) AddConnection(conn Socket) {
	c.Mu.Lock()
	defer c.Mu.Unlock()
	c.Conns = append(c.Conns, conn)
}

func CaptureSocketEvents(socket *Socket, Connections *Connections, rooms *map[string]Room) {

	for {

		jsonMessage := Message{}
		err := socket.Conn.ReadJSON(&jsonMessage)

		if err != nil {
			fmt.Printf("\nJson Message Error: %v\n", err)
			if strings.Contains(err.Error(), "close") {
				break
			}
			continue
		}

		msg, _ := json.Marshal(jsonMessage)

		fmt.Printf("\nJSON message: %v\n", string(msg))

		switch jsonMessage.EventName {
		case "join_room":
			// add room to socket and add socket to rooms map
		case "send_message_to_room":
			if room, ok := (*rooms)[jsonMessage.Room]; ok {
				room.Broadcast <- &jsonMessage
			}

		case "send_message_to_all":
			for _, socket := range Connections.Conns {
				err := socket.Conn.WriteJSON(string(msg))
				if err != nil {
					fmt.Printf("\nError while sending message: %v\n", err)
					continue
				}
			}
		default:
			socket.Conn.WriteMessage(1, []byte("Error: That event does not exist"))
		}

	}
}

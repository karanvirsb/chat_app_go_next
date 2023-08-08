package websockets

import (
	"encoding/json"
	"fmt"
)

type Room struct {
	Name       string
	Register   chan *Socket
	Unregister chan *Socket
	Sockets    map[*Socket]bool
	Broadcast  chan *Message[any]
}

func NewRoom(name string) *Room {
	return &Room{
		Name:       name,
		Register:   make(chan *Socket),
		Unregister: make(chan *Socket),
		Sockets:    make(map[*Socket]bool),
		Broadcast:  make(chan *Message[any]),
	}
}

func (room *Room) RunRoom() {
	for {
		select {
		case socket := <-room.Register:
			room.Sockets[socket] = true
			newUsernotification(room, socket)
		case socket := <-room.Unregister:
			_, ok := room.Sockets[socket]
			if ok {
				delete(room.Sockets, socket)
			}
		case message := <-room.Broadcast:
			for s := range room.Sockets {
				s.Conn.WriteJSON(*message)
			}
		}

	}
}

func newUsernotification(room *Room, socket *Socket) {
	message := Message[string]{Data: socket.Username, EventName: "user_online"}
	jsonMessage, err := json.Marshal(message)
	if err != nil {
		fmt.Printf("new user notification error: %v", err)
		return
	}
	for s := range room.Sockets {
		s.Conn.WriteJSON(jsonMessage)
	}
}

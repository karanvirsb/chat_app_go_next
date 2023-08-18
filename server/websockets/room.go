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
	Broadcast  chan []byte
}

func NewRoom(name string) *Room {
	return &Room{
		Name:       name,
		Register:   make(chan *Socket),
		Unregister: make(chan *Socket),
		Sockets:    make(map[*Socket]bool),
		Broadcast:  make(chan []byte),
	}
}

func (room *Room) RunRoom(in chan bool) {
out:
	for {
		select {
		case socket := <-room.Register:
			room.Sockets[socket] = true
			go newUsernotification(room, socket)
		case socket := <-room.Unregister:
			_, ok := room.Sockets[socket]
			if ok {
				delete(room.Sockets, socket)
				go userLeftNotification(room, socket)
			}
		case message := <-room.Broadcast:
			for s := range room.Sockets {
				s.writeJSON(string(message), nil)
			}
		case done := <-in:
			if done {
				break out
			}
		}
	}
}

func newUsernotification(room *Room, socket *Socket) {
	fmt.Printf("Registering socket: %v\n", socket.Username)
	message := Message[User]{Data: User{Username: socket.Username, Id: socket.Id}, EventName: "user_online", Room: room.Name}
	jsonMessage, err := json.Marshal(message)
	if err != nil {
		fmt.Printf("new user notification error: %v", err)
		return
	}
	for s := range room.Sockets {
		if s.Id == socket.Id {
			continue
		}
		s.writeJSON(string(jsonMessage), nil)
	}
}
func userLeftNotification(room *Room, socket *Socket) {
	fmt.Printf("Removing socket: %v\n", socket.Username)
	message := Message[User]{Data: User{Username: socket.Username, Id: socket.Id}, EventName: "user_left", Room: room.Name}
	jsonMessage, err := json.Marshal(message)
	if err != nil {
		fmt.Printf("left user notification error: %v", err)
		return
	}
	for s := range room.Sockets {
		if s.Id == socket.Id {
			continue
		}
		s.writeJSON(string(jsonMessage), nil)
	}
}

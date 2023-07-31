package websockets

type Room struct {
	Name       string
	Register   chan *Socket
	Unregister chan *Socket
	Sockets    map[*Socket]bool
	Broadcast  chan *Message
}

func NewRoom(name string) *Room {
	return &Room{
		Name:       name,
		Register:   make(chan *Socket),
		Unregister: make(chan *Socket),
		Sockets:    make(map[*Socket]bool),
		Broadcast:  make(chan *Message),
	}
}

func (room *Room) RunRoom() {
	for {
		select {
		case socket := <-room.Register:
			room.Sockets[socket] = true
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

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

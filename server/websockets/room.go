package websockets

type Room struct {
	Name       string
	Register   chan *Socket
	Unregister chan *Socket
	Sockets    map[*Socket]bool
	Broadcast  chan *Message
}

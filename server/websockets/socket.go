package websockets

import (
	"sync"

	"github.com/gorilla/websocket"
)

type ISocket interface {
	read(*interface{}) (Message[any], error)
}

type Socket struct {
	Id       string
	Username string
	Conn     *websocket.Conn
	mu       sync.Mutex
}

func (s *Socket) read() (Message[any], error) {
	jsonMessage := Message[any]{}
	err := s.Conn.ReadJSON(&jsonMessage)
	return jsonMessage, err
}

func (s *Socket) writeJSON(v interface{}) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.Conn.WriteJSON(v)
}

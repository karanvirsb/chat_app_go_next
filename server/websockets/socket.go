package websockets

import "github.com/gorilla/websocket"

type ISocket interface {
	read(*interface{}) (Message[any], error)
}

type Socket struct {
	Id       string
	Username string
	Conn     *websocket.Conn
}

func (s *Socket) read() (Message[any], error) {
	jsonMessage := Message[any]{}
	err := s.Conn.ReadJSON(&jsonMessage)
	return jsonMessage, err
}

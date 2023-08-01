package websockets

import "github.com/gorilla/websocket"

type ISocket interface {
	read(*interface{}) (Message, error)
}

type Socket struct {
	Id   string
	Conn *websocket.Conn
}

func (s *Socket) read() (Message, error) {
	jsonMessage := Message{}
	err := s.Conn.ReadJSON(&jsonMessage)
	return jsonMessage, err
}

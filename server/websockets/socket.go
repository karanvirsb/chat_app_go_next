package websockets

import "github.com/gorilla/websocket"

type Socket struct {
	Id   string
	Conn *websocket.Conn
}

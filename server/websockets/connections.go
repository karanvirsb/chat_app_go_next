package websockets

import (
	"encoding/json"
	"fmt"
	"sync"
)

type Connections struct {
	Mu    sync.Mutex
	Conns []*Socket
}

func (c *Connections) AddConnection(conn *Socket) {
	c.Mu.Lock()
	defer c.Mu.Unlock()
	c.Conns = append(c.Conns, conn)
}

func (c *Connections) RemoveConnection(conn *Socket) {
	c.Mu.Lock()
	defer c.Mu.Unlock()

	index := 0

	for i, s := range c.Conns {
		if s.Id == conn.Id {
			index = i
		}
	}

	c.Conns = append(c.Conns[:index], c.Conns[index+1:]...)
}

type UserStatusMessage struct {
	Id       string `json:"id"`
	Username string `json:"username"`
}

func (c *Connections) NotifyUsersOfLeave(s *Socket) {
	c.Mu.Lock()
	defer c.Mu.Unlock()
	leftMessage, err := json.Marshal(Message[UserStatusMessage]{Data: UserStatusMessage{Id: s.Id, Username: s.Username}, EventName: "user_disconnected"})
	if err != nil {
		fmt.Printf("Left Message Error: %v", err)
		return
	}
	for _, socket := range c.Conns {
		socket.writeJSON(string(leftMessage), nil)
	}
}

func (c *Connections) NotifyUsersOfConnectedUser(s *Socket, cb func()) {
	fmt.Printf("Sending Notification to Connections: %v\n", s.Username)
	c.Mu.Lock()
	defer func() {
		c.Mu.Unlock()
		if cb == nil {
			return
		}
		cb()
	}()
	joinMessage, err := json.Marshal(Message[UserStatusMessage]{Data: UserStatusMessage{Id: s.Id, Username: s.Username}, EventName: "user_connected"})
	if err != nil {
		fmt.Printf("User Connected Message Error: %v", err)
		return
	}

	for _, socket := range c.Conns {
		fmt.Printf("Sending to connection: %v\n", socket.Username)
		err = socket.writeJSON(string(joinMessage), nil)
		if err != nil {
			fmt.Printf("Sending Connection Error for user %v: %v\n", socket.Username, err)
		}
	}
}

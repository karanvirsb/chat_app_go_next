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

type UserLeftMessage struct {
	Id string `json:"id"`
}

func (c *Connections) NotifyUsersOfLeave(s *Socket) {
	c.Mu.Lock()
	defer c.Mu.Unlock()
	leftMessage, err := json.Marshal(Message[UserLeftMessage]{Data: UserLeftMessage{Id: s.Id}, EventName: "user_disconnected"})
	if err != nil {
		fmt.Printf("Left Message Error: %v", err)
		return
	}
	for _, s := range c.Conns {
		s.writeJSON(string(leftMessage))
	}
}

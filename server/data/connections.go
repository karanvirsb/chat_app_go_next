package data

import (
	"encoding/json"
	"fmt"
	"sync"
)

type Connections struct {
	Mu    sync.Mutex
	Conns []*Socket
}

type UserStatusMessage struct {
	Id       string `json:"id"`
	Username string `json:"username"`
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

func (c *Connections) NotifyUsersOfLeave(s *Socket) {
	c.Mu.Lock()
	defer c.Mu.Unlock()
	leftMessage, err := json.Marshal(Message[UserStatusMessage]{Data: UserStatusMessage{Id: s.Id, Username: s.Username}, EventName: "user_disconnected"})
	if err != nil {
		fmt.Printf("Left Message Error: %v", err)
		return
	}
	for _, socket := range c.Conns {
		if socket.Id == s.Id {
			continue
		}
		socket.WriteJSON(string(leftMessage), nil)
	}
}

func (c *Connections) GetUsers() []User {
	c.Mu.Lock()
	defer c.Mu.Unlock()

	users := make([]User, len(c.Conns))

	for _, socket := range c.Conns {
		if len(socket.Username) == 0 {
			continue
		}
		users = append(users, User{Id: socket.Id, Username: socket.Username})
	}

	return users
}

func (c *Connections) NotifyUsersOfConnectedUser(s *Socket, cb func()) {
	fmt.Printf("Sending Notification to Connections: %v\n", s.Username)
	c.Mu.Lock()
	defer c.Mu.Unlock()

	joinMessage, err := json.Marshal(Message[UserStatusMessage]{Data: UserStatusMessage{Id: s.Id, Username: s.Username}, EventName: "user_connected"})
	if err != nil {
		fmt.Printf("User Connected Message Error: %v", err)
		return
	}

	for _, socket := range c.Conns {
		if socket.Id == s.Id {
			continue
		}
		fmt.Printf("Sending to connection: %v\n", socket.Username)
		err = socket.WriteJSON(string(joinMessage), nil)
		if err != nil {
			fmt.Printf("Sending Connection Error for user %v: %v\n", socket.Username, err)
		}
	}
}

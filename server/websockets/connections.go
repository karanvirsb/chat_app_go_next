package websockets

import (
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

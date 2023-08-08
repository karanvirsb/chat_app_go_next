package websockets

import "sync"

type Connections struct {
	Mu    sync.Mutex
	Conns []*Socket
}

func (c *Connections) AddConnection(conn *Socket) {
	c.Mu.Lock()
	defer c.Mu.Unlock()
	c.Conns = append(c.Conns, conn)
}

package data

type Message[T any] struct {
	Data      T      `json:"data,omitempty"`
	EventName string `json:"eventName,omitempty"`
	Room      string `json:"room,omitempty"`
}

type MessageJoinRoom struct {
	Username string   `json:"username,omitempty"`
	Rooms    []string `json:"rooms,omitempty"`
}

type MessageConnectedUsers struct {
	Users []User `json:"users,omitempty"`
}

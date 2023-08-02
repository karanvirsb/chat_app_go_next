package websockets

import (
	"encoding/json"
	"fmt"
	"strings"
)

type Message struct {
	Data      any    `json:"data,omitempty"`
	EventName string `json:"eventName,omitempty"`
	Room      string `json:"room,omitempty"`
}

func CaptureSocketEvents(socket *Socket, Connections *Connections, rooms *map[string]Room) {

	for {

		jsonMessage, err := socket.read()

		if err != nil {
			fmt.Printf("\nJson Message Error: %v\n", err)
			if strings.Contains(err.Error(), "close") {
				break
			}
			continue
		}

		msg, _ := json.Marshal(jsonMessage)

		fmt.Printf("\nJSON message: %v\n", string(msg))

		switch jsonMessage.EventName {
		case "join_room":
			// add room to socket and add socket to rooms map
			if foundRoom := DoesRoomExist(*rooms, jsonMessage.Room); foundRoom != nil {
				fmt.Println("Found room")

				go foundRoom.RunRoom()
				foundRoom.Register <- socket
				defer func() { foundRoom.Unregister <- socket }()
			} else {
				fmt.Println("New room")
				newRoom := NewRoom(jsonMessage.Room)

				go newRoom.RunRoom()
				defer func() { newRoom.Unregister <- socket }()
				newRoom.Register <- socket
				(*rooms)[jsonMessage.Room] = *newRoom
			}

		case "send_message_to_room":
			if room, ok := (*rooms)[jsonMessage.Room]; ok {
				room.Broadcast <- &jsonMessage
			}

		case "send_message_to_all":
			for _, socket := range Connections.Conns {
				err := socket.Conn.WriteJSON(string(msg))
				if err != nil {
					fmt.Printf("\nError while sending message: %v\n", err)
					continue
				}
			}
		default:
			socket.Conn.WriteMessage(1, []byte("Error: That event does not exist"))
		}

	}
}
func DoesRoomExist(rooms map[string]Room, roomName string) *Room {
	r, ok := rooms[roomName]
	if !ok {
		return nil
	}
	return &r
}

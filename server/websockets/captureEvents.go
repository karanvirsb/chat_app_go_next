package websockets

import (
	"encoding/json"
	"fmt"
	"strings"
)

type Message[T any] struct {
	Data      T      `json:"data,omitempty"`
	EventName string `json:"eventName,omitempty"`
	Room      string `json:"room,omitempty"`
}

type MessageJoinRoom struct {
	Username string `json:"username,omitempty"`
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
			fmt.Printf("Join room case: %v\n", jsonMessage.Room)
			msg := Message[MessageJoinRoom]{}
			err := socket.Conn.ReadJSON(&msg)

			if err != nil {
				fmt.Printf("Error not a json - \n%v\n - \n%v\n", msg, err)
				return
			}

			socket.Username = msg.Data.Username
			// add room to socket and add socket to rooms map
			fmt.Printf("Does Room %v Exist: %v\n", msg.Room, DoesRoomExist(rooms, msg.Room))
			if foundRoom := DoesRoomExist(rooms, msg.Room); foundRoom != nil {
				fmt.Printf("Found room: %v\n", msg.Room)
				// wg.Add(1)
				go foundRoom.RunRoom()
				foundRoom.Register <- socket
				defer func() { foundRoom.Unregister <- socket }()
			} else {
				fmt.Printf("New room: %v\n", msg.Room)
				newRoom := NewRoom(msg.Room)
				// wg.Add(1)
				go newRoom.RunRoom()
				defer func() { newRoom.Unregister <- socket }()
				newRoom.Register <- socket
				(*rooms)[msg.Room] = *newRoom
			}
			//joinRoomEvent(socket, rooms)
			// wg.Wait()

			// wg.Done()
			fmt.Printf("Ended join room: %v", msg.Room)

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
func DoesRoomExist(rooms *map[string]Room, roomName string) *Room {
	r, ok := (*rooms)[roomName]
	if !ok {
		return nil
	}
	return &r
}

// func joinRoomEvent(socket *Socket, rooms *map[string]Room) {
// 	// wg := sync.WaitGroup{}
// }

package websockets

import (
	"bytes"
	"encoding/json"
	"fmt"

	"log"
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
	var (
		buf    bytes.Buffer
		logger = log.New(&buf, "capture socket events logger: ", log.Default().Flags())
	)
	for {

		jsonMessage, err := socket.read()

		if err != nil {

			logger.Printf("\nJson Message Error: %v\n", err)
			if strings.Contains(err.Error(), "close") {
				break
			}
			continue
		}

		msg, _ := json.Marshal(jsonMessage)

		logger.Printf("\nJSON message: %v\n", string(msg))

		switch jsonMessage.EventName {
		case "join_room":
			logger.Printf("Join room case: %v\n", jsonMessage.Room)
			msg := Message[MessageJoinRoom]{}
			err := socket.Conn.ReadJSON(&msg)

			if err != nil {
				logger.Printf("Error not a json - \n%v\n - \n%v\n", msg, err)
				return
			}

			socket.Username = msg.Data.Username
			// add room to socket and add socket to rooms map
			logger.Printf("Does Room %v Exist: %v\n", msg.Room, DoesRoomExist(rooms, msg.Room))
			if foundRoom := DoesRoomExist(rooms, msg.Room); foundRoom != nil {
				logger.Printf("Found room: %v\n", msg.Room)
				// wg.Add(1)
				go foundRoom.RunRoom()
				foundRoom.Register <- socket
				defer func() { foundRoom.Unregister <- socket }()
			} else {
				logger.Printf("New room: %v\n", msg.Room)
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
			logger.Printf("Ended join room: %v", msg.Room)

		case "send_message_to_room":
			if room, ok := (*rooms)[jsonMessage.Room]; ok {
				room.Broadcast <- &jsonMessage
			}

		case "send_message_to_all":
			for _, socket := range Connections.Conns {
				err := socket.Conn.WriteJSON(string(msg))
				if err != nil {
					logger.Printf("\nError while sending message: %v\n", err)
					continue
				}
			}
		default:
			socket.Conn.WriteMessage(1, []byte("Error: That event does not exist"))
		}

		fmt.Println(&buf)
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

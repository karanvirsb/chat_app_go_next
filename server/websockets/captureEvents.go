package websockets

import (
	"chat_app_server/data"
	"chat_app_server/websockets/eventHandlers"
	"encoding/json"
	"fmt"
	"sync"

	"strings"
)

func CaptureSocketEvents(socket *data.Socket, Connections *data.Connections, rooms *map[string]data.Room) {

	wg := sync.WaitGroup{}

	done := make(chan bool)
	defer func() {
		fmt.Printf("Ending capture connection")
	}()

	for {

		jsonMessage, err := socket.Read()

		if err != nil {
			fmt.Printf("\nJson Message Error: %v\n", err)
			if strings.Contains(err.Error(), "close") || strings.Contains(err.Error(), "RSV") {
				done <- true
				go Connections.RemoveConnection(socket)
				go Connections.NotifyUsersOfLeave(socket)
				break
			}
			continue
		}

		msg, _ := json.Marshal(jsonMessage)
		fmt.Printf("\nJSON message: %v\n", string(msg))
		switch jsonMessage.EventName {
		case "join_room":
			joinRoomCase(&wg, socket, rooms, msg, done, Connections)

		case "send_message_to_room":
			if room, ok := (*rooms)[jsonMessage.Room]; ok {
				room.Broadcast <- msg
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
	wg.Wait()
}

func joinRoomCase(wg *sync.WaitGroup, socket *data.Socket, rooms *map[string]data.Room, msg []byte, done chan bool, Connections *data.Connections) {
	message := make(chan *data.Socket)

	wg.Add(1)
	go func() {
		defer wg.Done()
		eventHandlers.JoinRoomEventHandler(socket, rooms, &msg, message, done)
	}()

	socketWithUsername := <-message

	wg.Add(1)
	go func() {
		defer wg.Done()
		Connections.NotifyUsersOfConnectedUser(socketWithUsername, nil)
	}()

	users := Connections.GetUsers()

	msg, err := json.Marshal(data.Message[data.MessageConnectedUsers]{EventName: "connected_users", Data: data.MessageConnectedUsers{Users: users}})
	if err != nil {
		fmt.Printf("connected users error: %v", err)
	}

	wg.Add(1)
	go func() {
		defer wg.Done()
		socketWithUsername.WriteJSON(string(msg), nil)
	}()
}

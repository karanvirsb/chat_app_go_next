package websockets

import (
	"encoding/json"
	"fmt"
	"sync"

	"strings"

	"github.com/fatih/color"
)

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

// var (
// 	buf    bytes.Buffer
// 	fmt.= log.New(&buf, "capture socket events logger: ", log.Default().Flags())
// )

func CaptureSocketEvents(socket *Socket, Connections *Connections, rooms *map[string]Room) {
	// buf.Grow(30000)
	wg := sync.WaitGroup{}

	defer func() {
		Connections.RemoveConnection(socket)
		Connections.NotifyUsersOfLeave(socket)
	}()

	for {

		jsonMessage, err := socket.read()

		if err != nil {
			fmt.Printf("\nJson Message Error: %v\n", err)
			// printBuffer()
			if strings.Contains(err.Error(), "close") || strings.Contains(err.Error(), "RSV") {
				break
			}
			continue
		}

		msg, _ := json.Marshal(jsonMessage)
		fmt.Printf("\nJSON message: %v\n", string(msg))
		switch jsonMessage.EventName {
		case "join_room":
			wg.Add(1)
			message := make(chan *Socket)
			go joinRoomEvent(socket, rooms, &msg, message)
			socket := <-message
			wg.Add(2)
			go Connections.NotifyUsersOfConnectedUser(socket)
			users := GetUsers(socket, Connections)
			msg, err := json.Marshal(Message[MessageConnectedUsers]{EventName: "connected_users", Data: MessageConnectedUsers{Users: users}})
			if err != nil {
				fmt.Printf("connected users error: %v", err)
			}
			wg.Add(3)
			go socket.writeJSON(string(msg))

		case "send_message_to_room":
			if room, ok := (*rooms)[jsonMessage.Room]; ok {
				room.Broadcast <- msg
			}

		case "send_message_to_all":
			for _, socket := range Connections.Conns {
				err := socket.Conn.WriteJSON(string(msg))
				if err != nil {
					fmt.Printf("\nError while sending message: %v\n", err)
					// printBuffer()
					continue
				}
			}
		default:
			socket.Conn.WriteMessage(1, []byte("Error: That event does not exist"))
		}
		// printBuffer()
	}
	wg.Wait()
}

// func printBuffer() {
// 	fmt.Println(&buf)
// 	buf.Reset()
// }

func DoesRoomExist(rooms *map[string]Room, roomName string) *Room {
	r, ok := (*rooms)[roomName]
	if !ok {
		return nil
	}
	return &r
}

func joinRoomEvent(socket *Socket, rooms *map[string]Room, message *[]byte, out chan *Socket) {
	wg := sync.WaitGroup{}
	msg := Message[MessageJoinRoom]{}
	err := json.Unmarshal(*message, &msg)

	if err != nil {
		fmt.Printf("Error not a json - \n%v\n - \n%v\n", msg, err)
		if strings.Contains(err.Error(), "close") {
			wg.Done()
			return
		}

	}

	fmt.Printf("Join rooms case: %v\n", msg.Data.Rooms)

	socket.Username = msg.Data.Username
	out <- socket
	close(out)
	// add room to socket and add socket to rooms map
	wg.Add(len(msg.Data.Rooms))
	for _, room := range msg.Data.Rooms {

		if foundRoom := DoesRoomExist(rooms, room); foundRoom != nil {

			fmt.Printf("%v: %v\n", color.BlueString("Found Room"), room)
			foundRoom.Register <- socket
			defer func() { foundRoom.Unregister <- socket }()
		} else {
			fmt.Printf("%v: %v\n", color.BlueString("Created New Room"), room)
			newRoom := NewRoom(room)
			(*rooms)[room] = *newRoom
			go newRoom.RunRoom()
			newRoom.Register <- socket
			defer func() {
				newRoom.Unregister <- socket
			}()
		}
	}
	wg.Wait()

	defer func() {
		fmt.Printf("%v: %v", color.GreenString("Ended join rooms for socket"), socket.Username)
	}()

}

type User struct {
	Username string `json:"username"`
	Id       string `json:"id"`
}

func GetUsers(s *Socket, connections *Connections) []User {
	users := make([]User, len(connections.Conns))

	for _, socket := range connections.Conns {
		if len(socket.Id) == 0 {
			continue
		}
		users = append(users, User{Id: socket.Id, Username: socket.Username})
	}

	return users
}

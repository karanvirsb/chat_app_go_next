package websockets

import (
	"bytes"
	"encoding/json"
	"fmt"
	"sync"

	"log"
	"strings"
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

var (
	buf    bytes.Buffer
	logger = log.New(&buf, "capture socket events logger: ", log.Default().Flags())
)

func CaptureSocketEvents(socket *Socket, Connections *Connections, rooms *map[string]Room) {
	defer func() {
		Connections.RemoveConnection(socket)
		Connections.NotifyUsersOfLeave(socket)
	}()
	buf.Grow(30000)
	// wg := sync.WaitGroup{}
	for {

		jsonMessage, err := socket.read()

		if err != nil {
			logger.Printf("\nJson Message Error: %v\n", err)
			go printBuffer()
			if strings.Contains(err.Error(), "close") || strings.Contains(err.Error(), "RSV") {
				socket.Conn.WriteJSON("")
				break
			}
			continue
		}

		msg, _ := json.Marshal(jsonMessage)
		logger.Printf("\nJSON message: %v\n", string(msg))
		go printBuffer()
		switch jsonMessage.EventName {
		case "join_room":
			// wg.Add(count)
			message := make(chan *Socket)
			go joinRoomEvent(socket, rooms, &msg, message)
			socket := <-message
			go Connections.NotifyUsersOfConnectedUser(socket)
			users := GetUsers(socket, Connections)
			msg, err := json.Marshal(Message[MessageConnectedUsers]{EventName: "connected_users", Data: MessageConnectedUsers{Users: users}})
			if err != nil {
				logger.Printf("connected users error: %v", err)
			}
			socket.writeJSON(string(msg))

		case "send_message_to_room":
			if room, ok := (*rooms)[jsonMessage.Room]; ok {
				room.Broadcast <- msg
			}

		case "send_message_to_all":
			for _, socket := range Connections.Conns {
				err := socket.Conn.WriteJSON(string(msg))
				if err != nil {
					logger.Printf("\nError while sending message: %v\n", err)
					go printBuffer()
					continue
				}
			}
		default:
			socket.Conn.WriteMessage(1, []byte("Error: That event does not exist"))
		}
	}
}

func printBuffer() {
	fmt.Println(&buf)
	buf.Reset()
}

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
		logger.Printf("Error not a json - \n%v\n - \n%v\n", msg, err)
		if strings.Contains(err.Error(), "close") {
			wg.Done()
			return
		}

	}

	logger.Printf("Join rooms case: %v\n", msg.Data.Rooms)

	socket.Username = msg.Data.Username
	out <- socket
	close(out)
	// add room to socket and add socket to rooms map
	wg.Add(len(msg.Data.Rooms))
	for _, room := range msg.Data.Rooms {

		logger.Printf("Does Room %v Exist: %v\n", room, DoesRoomExist(rooms, room))
		if foundRoom := DoesRoomExist(rooms, room); foundRoom != nil {
			logger.Printf("Found room: %v\n", room)
			foundRoom.Register <- socket
			defer func() { foundRoom.Unregister <- socket }()

		} else {
			logger.Printf("New room: %v\n", room)
			newRoom := NewRoom(room)
			(*rooms)[room] = *newRoom
			go newRoom.RunRoom()
			newRoom.Register <- socket
			defer func() { newRoom.Unregister <- socket }()
		}
	}
	wg.Wait()

	defer func() {
		wg.Done()
		logger.Printf("Ended join rooms for socket %v", socket.Username)
	}()

}

type User struct {
	Username string `json:"username"`
	Id       string `json:"id"`
}

func GetUsers(s *Socket, connections *Connections) []User {
	users := make([]User, len(connections.Conns))

	for _, socket := range connections.Conns {
		if s.Id == socket.Id {
			continue
		}
		users = append(users, User{Id: socket.Id, Username: socket.Username})
	}

	return users
}

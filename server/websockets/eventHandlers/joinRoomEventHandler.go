package eventHandlers

import (
	"chat_app_server/data"
	"encoding/json"
	"fmt"
	"strings"
	"sync"

	"github.com/fatih/color"
)

func JoinRoomEventHandler(socket *data.Socket, rooms *map[string]data.Room, message *[]byte, out chan *data.Socket, in chan bool) {
	wg := sync.WaitGroup{}
	msg := data.Message[data.MessageJoinRoom]{}
	err := json.Unmarshal(*message, &msg)

	if err != nil {
		fmt.Printf("Error not a json - \n%v\n - \n%v\n", msg, err)
		if strings.Contains(err.Error(), "close") {
			return
		}

	}

	fmt.Printf("Join rooms case: %v\n", msg.Data.Rooms)

	socket.Username = msg.Data.Username
	out <- socket
	close(out)
	// add room to socket and add socket to rooms map

	for _, room := range msg.Data.Rooms {

		if foundRoom := DoesRoomExist(rooms, room); foundRoom != nil {
			wg.Add(1)
			go func() {
				defer func() {
					wg.Done()
					foundRoom.Unregister <- socket
					fmt.Printf("**Ending found room %v\n", (*foundRoom).Name)
					in <- true
				}()
				foundRoom.RunRoom(in)
			}()
			foundRoom.Register <- socket
		} else {
			fmt.Printf("%v: %v\n", color.BlueString("Created New Room"), room)
			newRoom := data.NewRoom(room)
			(*rooms)[room] = *newRoom
			wg.Add(1)
			go func() {
				defer func() {
					fmt.Printf("**Ending new room %v\n", (*newRoom).Name)
					newRoom.Unregister <- socket
					wg.Done()
					in <- true
				}()
				newRoom.RunRoom(in)
			}()
			newRoom.Register <- socket
		}
	}
	defer func() {
		fmt.Printf("%v: %v\n", color.GreenString("Ended join rooms for socket"), socket.Username)
	}()

	wg.Wait()

}

func DoesRoomExist(rooms *map[string]data.Room, roomName string) *data.Room {
	r, ok := (*rooms)[roomName]
	if !ok {
		return nil
	}
	return &r
}

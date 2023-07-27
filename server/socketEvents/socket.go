package socketEvents

import (
	"fmt"
)

func CaptureSocketEvents(socket Socket) {

	for {
		msgType, msg, err := socket.conn.ReadMessage()
		jsonMessage := Message[any]{}
		errr := socket.conn.ReadJSON(&jsonMessage)

		if err != nil {
			fmt.Printf("Read Message Error: %v\n", err)
		}
		fmt.Printf("\nmsgType: %v\nmsg: %v\n\n", msgType, string(msg))
		if errr != nil {
			fmt.Printf("\nJson Message Error: %v\n", errr)
		}
		//fmt.Printf("\nJSON message: %v\n", json.NewDecoder(r.Body).Decode(jsonMessage))
		// fmt.Printf("%v -- sent message: %v\n", conn.RemoteAddr(), string(msg))
		for _, con := range connections.conns {
			err = con.conn.WriteMessage(msgType, msg)
			if err != nil {
				fmt.Printf("Error while sending message: %v", err)
			}
		}
		// Write message back to browser
		// if err = conn.WriteMessage(msgType, msg); err != nil {
		// 	return
		// }
	}
}

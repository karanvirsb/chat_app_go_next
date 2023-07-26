package main

import (
	"chat_app_server/socketEvents"
	"fmt"
	"net/http"
)

func main() {

	http.HandleFunc("/socket", socketEvents.CaptureSocketEvents)
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Server request")
	})
	http.ListenAndServe(":8000", nil)
}

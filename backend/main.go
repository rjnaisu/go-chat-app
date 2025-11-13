package main

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"tutorial/go-chat-app/pkg/websocket"
)

func serveWs(pool *websocket.Pool, w http.ResponseWriter, r *http.Request) {
	fmt.Println("Websocket Endpoint Hit")
	conn, err := websocket.Upgrade(w, r)
	if err != nil {
		fmt.Fprint(w, "%+V\n", err)
	}
	username := strings.TrimSpace(r.URL.Query().Get("username"))
	if username == "" {
		username = fmt.Sprintf("Guest-%d", time.Now().UnixNano())
	}
	client := &websocket.Client{
		Conn: conn,
		Pool: pool,
		Name: username,
	}
	pool.Register <- client
	client.Read()
}

func setupRoutes() {
	pool := websocket.NewPool()
	go pool.Start()

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(pool, w, r)
	})
}

func main() {
	fmt.Println("Chat App v0.01")
	setupRoutes()
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("server failed to start: %v", err)
	}
}

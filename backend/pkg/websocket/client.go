package websocket

import (
	"fmt"
	"log"

	"github.com/gorilla/websocket"
)

type Client struct {
	ID   string
	Name string
	Conn *websocket.Conn
	Pool *Pool
}

type Message struct {
	Type   int      `json:"type"`
	Body   string   `json:"body"`
	Author string   `json:"author,omitempty"`
	Event  string   `json:"event,omitempty"`
	Users  []string `json:"users,omitempty"`
}

func (c *Client) Read() {
	defer func() {
		c.Pool.Unregister <- c
		c.Conn.Close()
	}()

	for {
		messageType, p, err := c.Conn.ReadMessage()
		if err != nil {
			log.Println(err)
			return
		}
		message := Message{Type: messageType, Body: string(p), Author: c.Name, Event: "message"}
		c.Pool.Broadcast <- message
		fmt.Printf("Message Received: j%+v\n", message)
	}
}

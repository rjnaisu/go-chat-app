package websocket

import (
	"fmt"
	"sort"
)

type Pool struct {
	Register   chan *Client
	Unregister chan *Client
	Clients    map[*Client]bool
	Broadcast  chan Message
}

func NewPool() *Pool {
	return &Pool{
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Clients:    make(map[*Client]bool),
		Broadcast:  make(chan Message),
	}
}

func (pool *Pool) Start() {
	for {
		select {
		case client := <-pool.Register:
			pool.Clients[client] = true
			fmt.Println("Size of Connection Pool: ", len(pool.Clients))
			pool.broadcastSystemMessage(fmt.Sprintf("%s joined the chat", client.Name), "join", client.Name)
			pool.broadcastRoster()
		case client := <-pool.Unregister:
			if _, ok := pool.Clients[client]; ok {
				delete(pool.Clients, client)
			}
			fmt.Println("Size of Connection Pool: ", len(pool.Clients))
			pool.broadcastSystemMessage(fmt.Sprintf("%s left the chat", client.Name), "leave", client.Name)
			pool.broadcastRoster()
		case message := <-pool.Broadcast:
			fmt.Println("Sending message to all clients in Pool")
			for client := range pool.Clients {
				if err := client.Conn.WriteJSON(message); err != nil {
					fmt.Println(err)
					return
				}
			}
		}
	}
}

func (pool *Pool) broadcastSystemMessage(body, event, author string) {
	msg := Message{Type: 1, Body: body, Author: author, Event: event}
	for client := range pool.Clients {
		if err := client.Conn.WriteJSON(msg); err != nil {
			fmt.Println("broadcast system message error:", err)
		}
	}
}

func (pool *Pool) broadcastRoster() {
	users := pool.usernames()
	msg := Message{Type: 2, Event: "roster", Users: users}
	for client := range pool.Clients {
		if err := client.Conn.WriteJSON(msg); err != nil {
			fmt.Println("broadcast roster error:", err)
		}
	}
}

func (pool *Pool) usernames() []string {
	users := make([]string, 0, len(pool.Clients))
	for client := range pool.Clients {
		users = append(users, client.Name)
	}
	sort.Strings(users)
	return users
}

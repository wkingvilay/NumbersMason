package main

import (
	"bufio"
	"fmt"
	"net"
	"strings"
	"sync"
	"time"
)

// Client represents a connected user
type Client struct {
	conn     net.Conn
	username string
}

// Server holds all connected clients
type Server struct {
	clients map[net.Conn]*Client
	mu      sync.Mutex
}

func NewServer() *Server {
	return &Server{
		clients: make(map[net.Conn]*Client),
	}
}

// broadcast sends a message to all clients except the sender
func (s *Server) broadcast(sender net.Conn, message string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	for conn, client := range s.clients {
		if conn != sender {
			fmt.Fprintf(conn, "%s\n", message)
			_ = client // suppress unused warning
		}
	}
}

// broadcastAll sends a message to ALL clients (e.g. join/leave notices)
func (s *Server) broadcastAll(message string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	for conn := range s.clients {
		fmt.Fprintf(conn, "%s\n", message)
	}
}

func (s *Server) handleClient(conn net.Conn) {
	defer conn.Close()

	reader := bufio.NewReader(conn)

	// First message from client is the username
	fmt.Fprint(conn, "ENTER_USERNAME\n")
	username, err := reader.ReadString('\n')
	if err != nil {
		return
	}
	username = strings.TrimSpace(username)
	if username == "" {
		username = "Anonymous"
	}

	client := &Client{conn: conn, username: username}

	s.mu.Lock()
	s.clients[conn] = client
	count := len(s.clients)
	s.mu.Unlock()

	fmt.Printf("[SERVER] %s joined. Total clients: %d\n", username, count)
	s.broadcastAll(fmt.Sprintf("*** %s joined the chat ***", username))

	// Listen for messages
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			break
		}
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		timestamp := time.Now().Format("15:04:05")
		formatted := fmt.Sprintf("[%s] %s: %s", timestamp, username, line)

		fmt.Println(formatted) // log on server
		s.broadcast(conn, formatted)
	}

	// Client disconnected
	s.mu.Lock()
	delete(s.clients, conn)
	s.mu.Unlock()

	fmt.Printf("[SERVER] %s left.\n", username)
	s.broadcastAll(fmt.Sprintf("*** %s left the chat ***", username))
}

func main() {
	address := "localhost:9000"
	listener, err := net.Listen("tcp", address)
	if err != nil {
		fmt.Println("Error starting server:", err)
		return
	}
	defer listener.Close()

	fmt.Println("=================================")
	fmt.Println("  💬 Go Chat Server running")
	fmt.Printf("  Listening on %s\n", address)
	fmt.Println("=================================")

	server := NewServer()

	for {
		conn, err := listener.Accept()
		if err != nil {
			fmt.Println("Connection error:", err)
			continue
		}
		go server.handleClient(conn)
	}
}
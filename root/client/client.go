package main

import (
	"bufio"
	"fmt"
	"net"
	"os"
	"strings"
)

func main() {
	address := "localhost:9000"

	conn, err := net.Dial("tcp", address)
	if err != nil {
		fmt.Println("Could not connect to server:", err)
		fmt.Println("Make sure the server is running: go run server.go")
		os.Exit(1)
	}
	defer conn.Close()

	reader := bufio.NewReader(conn)
	stdinReader := bufio.NewReader(os.Stdin)

	// Wait for server to ask for username
	serverMsg, err := reader.ReadString('\n')
	if err != nil {
		fmt.Println("Error reading from server:", err)
		return
	}

	if strings.TrimSpace(serverMsg) == "ENTER_USERNAME" {
		fmt.Print("Enter your username: ")
		username, _ := stdinReader.ReadString('\n')
		username = strings.TrimSpace(username)
		fmt.Fprintf(conn, "%s\n", username)
		fmt.Printf("\n✅ Connected as '%s'. Start typing!\n", username)
		fmt.Println("----------------------------------")
	}

	// Goroutine: listen for incoming messages from server
	go func() {
		for {
			msg, err := reader.ReadString('\n')
			if err != nil {
				fmt.Println("\n[Disconnected from server]")
				os.Exit(0)
			}
			msg = strings.TrimSpace(msg)
			if msg != "" {
				// Move to new line cleanly so incoming messages don't interrupt typing
				fmt.Printf("\r%s\n> ", msg)
			}
		}
	}()

	// Main loop: read input and send to server
	for {
		fmt.Print("> ")
		line, err := stdinReader.ReadString('\n')
		if err != nil {
			break
		}
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		if line == "/quit" || line == "/exit" {
			fmt.Println("Goodbye!")
			break
		}

		fmt.Fprintf(conn, "%s\n", line)
	}
}
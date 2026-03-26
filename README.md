# (Placeholder name) - Encrypted peer to peer messaging

## Functionality 
(Placeholder name) uses a small bootstrap/relay server that allows two people to communicate directly over TCP sockets.
- Messages are encrypted end to end on the client side.
- Ensures reliable send/receive using TCP and message framing.

---

## How to run it

1. Clone the repository:
git clone https://github.com/wkingvilay/NumbersMason
cd NumbersMason

2. Build the app
go build -o chatapp main.go

3. Run the server
./chatapp -mode server -port 9000

4. Run the second client
./chatapp -mode client -ip <server-ip> -port 9000

5.
Type messages they are encrypted, sent, received, and decrypted automatically.
Replace <server-ip> with the actual IP of the first peer. TCP must be reachable.

## Architecture Diagram
```text
          +-------------------+
          |    Application    |  ← app.go (input/output, main loop, CLI to college and display messages while triggering encryption and network operations)
          +-------------------+
                    |
                    v
          +-------------------+
          |    Encryption     |  ← crypto.go (encrypt/decrypt messages coming in or out)
          +-------------------+
                    |
                    v
          +-------------------+
          |     Protocol      |  ← protocol.go (message framing to convert messages into a stream suitable for transport)
          +-------------------+
                    |
                    v
          +-------------------+
          |     Network       |  ← network.go (TCP sockets)
          +-------------------+
                    |
                    v
            Bootstrap / Relay
                    |
                    v
                 Peer Client
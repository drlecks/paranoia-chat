const WebSocket = require("ws");
const crypto = require("crypto");

const port = process.env.PORT || 8080;
const server = new WebSocket.Server({ port });
const doLog = true;

class EToServer {
    static REGISTER = "r";
    static LINK     = "l"; 
} 

class EFromServer {
    static ERROR        = "er";
    static REGISTER_OK  = "ro";
    static LINK_DATA    = "ld"; 
} 

// Store registered clients with their tokens
const clients = {};

function clog(message) {
    if (doLog) console.log(message);
}
function cerror(message) {
    if (doLog) console.error(message);
}

clog(`WebSocket server running on port ${port}`);

server.on("connection", (ws) => {
    clog("New client connected");

    ws.on("message", (message) => {
        try {
            const { type, payload } = JSON.parse(message);

            if (type === EToServer.REGISTER) {
                // Generate a secure random 32-byte token in hexadecimal format
                const token = crypto.randomBytes(32).toString("hex");
                clients[token] = ws;

                clog(`Client registered with token: ${token}`);
                ws.send(JSON.stringify({ status: EFromServer.REGISTER_OK, token }));
            } else if (type === EToServer.LINK) {
                const { token, data } = payload;

                // Validate the token format (32-byte hex string)
                if (!/^[a-f0-9]{64}$/.test(token)) {
                    ws.send(JSON.stringify({ status: EFromServer.ERROR, message: "Invalid token format" }));
                    cerror("Invalid token format received:", token);
                    return;
                }

                // Forward data to the client associated with the provided token
                if (clients[token]) {
                    clients[token].send(JSON.stringify({ status: EFromServer.LINK_DATA, data }));
                    clog(`Data sent to client with token: ${token}`);
                } else {
                    ws.send(JSON.stringify({ status: EFromServer.ERROR, message: "Invalid token or client disconnected" }));
                    cerror("Token not found or client disconnected:", token);
                }
            }
        } catch (err) {
            cerror("Error processing message:", err);
            ws.send(JSON.stringify({ status: EFromServer.ERROR, message: "Invalid message format" }));
        }
    });

    ws.on("close", () => {
        clog("Client disconnected");
        // Remove the disconnected client from the list
        Object.keys(clients).forEach((key) => {
            if (clients[key] === ws) {
                delete clients[key];
                clog(`Client with token ${key} removed`);
            }
        });
    });

    ws.on("error", (err) => {
        cerror("WebSocket error:", err);
    });
});

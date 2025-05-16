import { io } from "socket.io-client";

const URL = "https://okvidcall.webuat.online";

// Your server uses: path: "/socketio"
export const socket = io(URL, {
  path: "/socket.io", // ✅ match server `path` exactly
  transports: ["websocket"], // ✅ optional but recommended to force WebSocket
  secure: true, // ✅ since using HTTPS
  withCredentials: true, // ✅ to allow CORS with credentials
});

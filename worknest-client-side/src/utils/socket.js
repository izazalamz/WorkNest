import { io } from "socket.io-client";

const socket = io("https://worknest-u174.onrender.com", {
  transports: ["websocket"],
});

export default socket;

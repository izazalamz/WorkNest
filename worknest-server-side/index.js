const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");
const socketHandler = require("./socket/socket");

const PORT = process.env.PORT || 3000;

const userRoutes = require("./routes/userRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // frontend URL
    methods: ["GET", "POST"],
  },
});

// socket logic
socketHandler(io);

// DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use(userRoutes);
app.use("/dashboard", workspaceRoutes);
app.use("/dashboard", analyticsRoutes);
app.use("/api", attendanceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use(chatRoutes);

// server run
server.listen(PORT, () => {
  console.log(`Server + Socket.IO running on port ${PORT}`);
});

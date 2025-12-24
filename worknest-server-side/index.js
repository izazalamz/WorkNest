const express = require("express");
const cors = require("cors");
const jsonServer = require("json-server");
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
const taskRoutes = require("./routes/taskRoutes");
const port = process.env.PORT || 3000;
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

// Middleware - CORS with proper configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', '*'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware - Log ALL requests
app.use((req, res, next) => {
  console.log(`\n📍 [${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// ===== MONGODB ROUTES (Custom Backend) =====
// These handle attendance with MongoDB
app.use("/api", attendanceRoutes);
app.use("/api/notifications", notificationRoutes);

// ===== OTHER CUSTOM ROUTES =====
app.use(userRoutes);
app.use("/dashboard", workspaceRoutes);
app.use("/dashboard", analyticsRoutes);
app.use("/api", attendanceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/dashboard", taskRoutes);
app.use(chatRoutes);

// server run
server.listen(PORT, () => {
  console.log(`Server + Socket.IO running on port ${PORT}`);
});
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

app.get("/", (req, res) => {
  res.send("WorkNest - Optimize Your Hybrid Workspace Effortlessly");
});

// all routes for users
app.use(userRoutes);

// all routes for wrokspace -
app.use("/dashboard", workspaceRoutes); // api endpoint --> /dashboard/routes

// all routes for analytics
app.use("/dashboard", analyticsRoutes);
// all routes for notifications
app.use("/api/notifications", notificationRoutes);

app.listen(port, () => {
  console.log(`WorkNest is running on port: ${port}`);
});

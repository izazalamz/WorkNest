const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const bookingRoute = require("./routes/bookingRoute");

const { expireBookings } = require("./controllers/bookingController");


const port = process.env.PORT || 3000;

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();
  setInterval(expireBookings, 60 * 1000);

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
app.use("/api/bookings", bookingRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

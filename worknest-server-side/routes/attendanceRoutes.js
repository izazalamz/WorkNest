const express = require("express");
const router = express.Router();
const {
  checkIn,
  checkOut,
  getAttendance,
  getTotalHours,
  getActiveTodayUsers, // ADD THIS - Import the new function
} = require("../controllers/attendanceController");

// ============= NEW ROUTE - Get today's active users =============
router.get("/attendance/active-today", getActiveTodayUsers);

// ============= EXISTING ROUTES =============
router.post("/attendance/checkin", checkIn);
router.put("/attendance/checkout", checkOut);
router.get("/attendance/:employeeId", getAttendance);
router.get("/attendance/hours/:employeeId", getTotalHours);

module.exports = router;
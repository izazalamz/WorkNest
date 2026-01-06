const express = require("express");
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  checkInBooking,
  cancelBooking,
} = require("../controllers/bookingController");

/* Create booking */
router.post("/", createBooking);

/* Get my bookings (from bookings collection) */
router.get("/my", getMyBookings);

/* Check-in booking */
router.patch("/:bookingId/check-in", checkInBooking);

/* Cancel booking */
router.patch("/:bookingId/cancel", cancelBooking);

module.exports = router;

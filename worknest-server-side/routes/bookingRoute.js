const express = require("express");
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  cancelBooking,
} = require("../controllers/bookingController");

/* Create booking */
router.post("/", createBooking);

/* Get my bookings (from bookings collection) */
router.get("/my", getMyBookings);

/* Cancel booking */
router.patch("/:bookingId/cancel", cancelBooking);

module.exports = router;

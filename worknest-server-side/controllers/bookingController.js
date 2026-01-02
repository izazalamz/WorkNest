const Booking = require("../models/bookingModel");
const Workspace = require("../models/workspaceModel");
const User = require("../models/userModel");

/* =========================================================
   CREATE BOOKING
========================================================= */
const createBooking = async (req, res) => {
  try {
    const { workspaceId, startAt, endAt, googleEventId } = req.body;

    // 1️⃣ Fetch a user (temporary – no auth)
    const user = await User.findOne();
    if (!user) {
      return res.status(400).json({ message: "No user found in DB" });
    }

    // 2️⃣ Fetch workspace
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace || workspace.status !== "active") {
      return res.status(400).json({ message: "Workspace not available" });
    }

    // 3️⃣ Create booking
    const booking = await Booking.create({
      userId: user._id,
      workspaceId,
      startAt,
      endAt,
      status: "confirmed",
      calendar: {
        provider: "google",
        eventId: googleEventId,
        syncStatus: "synced",
      },
      createdBy: user._id,
    });

    // 4️⃣ Update workspace
    workspace.status = "inactive";
    workspace.startAt = startAt;
    workspace.endAt = endAt;
    await workspace.save();

    res.status(201).json({ success: true, booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Booking failed" });
  }
};

/* =========================================================
   GET MY BOOKINGS (FROM BOOKINGS COLLECTION ✅)
========================================================= */
const getMyBookings = async (req, res) => {
  try {
    // temporary user (no auth)
    const user = await User.findOne();
    if (!user) {
      return res.status(400).json({ message: "No user found" });
    }

    const bookings = await Booking.find({
      userId: user._id,
      status: "confirmed",
    })
      .populate("workspaceId") // important to get workspace details
      .sort({ startAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

/* =========================================================
   CANCEL BOOKING
========================================================= */
const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Update booking status
    booking.status = "cancelled";
    await booking.save();

    // Reactivate workspace
    await Workspace.findByIdAndUpdate(booking.workspaceId, {
      status: "active",
      startAt: null,
      endAt: null,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cancel booking failed" });
  }
};

/* =========================================================
   AUTO EXPIRE BOOKINGS (SAFE)
   Frees workspace after endAt if booking still confirmed
========================================================= */
const expireBookings = async () => {
  try {
    const now = new Date();

    const expiredBookings = await Booking.find({
      status: "confirmed",
      endAt: { $lte: now },
    });

    for (const booking of expiredBookings) {
      // Free workspace
      await Workspace.findByIdAndUpdate(booking.workspaceId, {
        status: "active",
        startAt: null,
        endAt: null,
      });

      // Mark booking as expired
      booking.status = "expired";
      await booking.save();

      console.log(`Booking ${booking._id} expired and workspace released`);
    }
  } catch (err) {
    console.error("Error expiring bookings:", err);
  }
};

// ⚠️ Export everything
module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  expireBookings,
};

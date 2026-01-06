const Booking = require("../models/bookingModel");
const Workspace = require("../models/workspaceModel");
const User = require("../models/userModel");

/* ==
   CREATE BOOKING
== */
const createBooking = async (req, res) => {
  try {
    const { workspaceId, startAt, endAt, googleEventId, uid } = req.body;

    //  Get user by UID (from frontend) or find first user as fallback
    let user;
    if (uid) {
      user = await User.findOne({ uid });
    } else {
      // Fallback: get first user (temporary – should use auth middleware)
      user = await User.findOne();
    }

    if (!user) {
      return res.status(400).json({ message: "No user found in DB" });
    }

    // Fetch workspace
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (workspace.status !== "active") {
      return res.status(400).json({ message: "Workspace is not available" });
    }

    // Check for overlapping bookings (prevent double booking)
    const overlappingBooking = await Booking.findOne({
      workspaceId,
      status: { $in: ["confirmed", "checked_in"] },
      $or: [
        {
          startAt: { $lt: new Date(endAt) },
          endAt: { $gt: new Date(startAt) },
        },
      ],
    });

    if (overlappingBooking) {
      return res.status(400).json({
        message: "Workspace is already booked for this time period",
      });
    }

    // Create booking (with optional Google Calendar integration)
    const bookingData = {
      userId: user._id,
      workspaceId,
      startAt,
      endAt,
      status: "confirmed",
      createdBy: user._id,
    };

    // Only add calendar data if googleEventId is provided
    if (googleEventId) {
      bookingData.calendar = {
        provider: "google",
        eventId: googleEventId,
        syncStatus: "synced",
      };
    }

    const booking = await Booking.create(bookingData);

    // Update workspace status
    workspace.status = "inactive";
    workspace.startAt = startAt;
    workspace.endAt = endAt;
    await workspace.save();

    res.status(201).json({ success: true, booking });
  } catch (err) {
    console.error("Booking creation error:", err);
    res.status(500).json({ message: "Booking failed", error: err.message });
  }
};

/* ==
   GET MY BOOKINGS (FROM BOOKINGS COLLECTION )
   Module 4, Requirement 4: Show all past/upcoming desk and meeting bookings per user
== */
const getMyBookings = async (req, res) => {
  try {
    // Get user UID from query parameter or request body
    const uid = req.query?.uid || req.body?.uid;

    if (!uid) {
      return res.status(400).json({ message: "User UID is required" });
    }

    // Find user by Firebase UID
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all bookings for this user (including past, confirmed, cancelled, expired)
    const allBookings = await Booking.find({
      userId: user._id,
    })
      .populate({
        path: "workspaceId",
        select: "name type location capacity amenities status", // Ensure workspace data is included
      })
      .sort({ startAt: -1 });

    console.log(
      `Found ${allBookings.length} total bookings for user ${user.uid}`
    );

    // Separate bookings into past and upcoming based on current time
    const now = new Date();
    const pastBookings = [];
    const upcomingBookings = [];

    allBookings.forEach((booking) => {
      // A booking is considered "past" if:
      // 1. Its end time has passed, OR
      // 2. It's been cancelled, OR
      // 3. It's been checked in, OR
      // 4. It's been marked as no_show or expired
      const isPast =
        new Date(booking.endAt) < now ||
        booking.status === "cancelled" ||
        booking.status === "checked_in" ||
        booking.status === "no_show" ||
        booking.status === "expired";

      if (isPast) {
        pastBookings.push(booking);
      } else {
        upcomingBookings.push(booking);
      }
    });

    console.log(
      `Past bookings: ${pastBookings.length}, Upcoming bookings: ${upcomingBookings.length}`
    );

    // Sort upcoming bookings by startAt (ascending - soonest first)
    upcomingBookings.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));

    // Sort past bookings by startAt (descending - most recent first)
    pastBookings.sort((a, b) => new Date(b.startAt) - new Date(a.startAt));

    res.status(200).json({
      success: true,
      pastBookings,
      upcomingBookings,
      totalBookings: allBookings.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

/* ==
   CHECK-IN BOOKING
== */
const checkInBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if booking is already checked in
    if (booking.check?.checkInAt) {
      return res.status(400).json({ message: "Booking already checked in" });
    }

    // Check if booking is still valid (not cancelled, expired, or no_show)
    if (booking.status !== "confirmed") {
      return res
        .status(400)
        .json({ message: "Cannot check in to this booking" });
    }

    // Update booking with check-in time and status
    booking.check = {
      checkInAt: new Date(),
      checkOutAt: null,
    };
    booking.status = "checked_in";
    await booking.save();

    res.status(200).json({ success: true, booking });
  } catch (err) {
    console.error("Check-in error:", err);
    res.status(500).json({ message: "Check-in failed", error: err.message });
  }
};

/* ==
   CANCEL BOOKING
== */
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

    // Reactivate workspace (only if it still exists)
    const workspace = await Workspace.findById(booking.workspaceId);
    if (workspace) {
      // Check if there are other active bookings for this workspace
      const otherActiveBookings = await Booking.countDocuments({
        workspaceId: booking.workspaceId,
        status: { $in: ["confirmed", "checked_in"] },
        _id: { $ne: booking._id },
      });

      // Only reactivate if no other active bookings exist
      if (otherActiveBookings === 0) {
        await Workspace.findByIdAndUpdate(booking.workspaceId, {
          status: "active",
          startAt: null,
          endAt: null,
        });
      }
    } else {
      console.warn(
        `Workspace ${booking.workspaceId} not found when canceling booking ${booking._id}`
      );
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cancel booking failed" });
  }
};

/* ==
   AUTO EXPIRE BOOKINGS (SAFE)
   Frees workspace after endAt if booking still confirmed
== */
const expireBookings = async () => {
  try {
    const now = new Date();

    const expiredBookings = await Booking.find({
      status: "confirmed",
      endAt: { $lte: now },
    });

    for (const booking of expiredBookings) {
      // Mark booking as expired
      booking.status = "expired";
      await booking.save();

      // Free workspace (only if it still exists and no other active bookings)
      const workspace = await Workspace.findById(booking.workspaceId);
      if (workspace) {
        const otherActiveBookings = await Booking.countDocuments({
          workspaceId: booking.workspaceId,
          status: { $in: ["confirmed", "checked_in"] },
          _id: { $ne: booking._id },
        });

        if (otherActiveBookings === 0) {
          await Workspace.findByIdAndUpdate(booking.workspaceId, {
            status: "active",
            startAt: null,
            endAt: null,
          });
          console.log(`Booking ${booking._id} expired and workspace released`);
        }
      } else {
        console.warn(
          `Workspace ${booking.workspaceId} not found when expiring booking ${booking._id}`
        );
      }
    }
  } catch (err) {
    console.error("Error expiring bookings:", err);
  }
};

/* ==
   AUTO TIMEOUT BOOKINGS (15 MINUTE RULE)
   Releases bookings that haven't been checked in within 15 minutes of startAt
== */
const timeoutBookings = async () => {
  try {
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    // Find bookings that:
    // 1. Are still confirmed (not checked in, cancelled, etc.)
    // 2. Started at least 15 minutes ago
    // 3. Haven't been checked in
    const timedOutBookings = await Booking.find({
      status: "confirmed",
      startAt: { $lte: fifteenMinutesAgo },
      $or: [
        { "check.checkInAt": { $exists: false } },
        { "check.checkInAt": null },
      ],
    });

    for (const booking of timedOutBookings) {
      // Mark booking as no_show
      booking.status = "no_show";
      await booking.save();

      // Free workspace (only if it still exists and no other active bookings)
      const workspace = await Workspace.findById(booking.workspaceId);
      if (workspace) {
        const otherActiveBookings = await Booking.countDocuments({
          workspaceId: booking.workspaceId,
          status: { $in: ["confirmed", "checked_in"] },
          _id: { $ne: booking._id },
        });

        if (otherActiveBookings === 0) {
          await Workspace.findByIdAndUpdate(booking.workspaceId, {
            status: "active",
            startAt: null,
            endAt: null,
          });
          console.log(
            `Booking ${booking._id} timed out (no check-in) and workspace released`
          );
        }
      } else {
        console.warn(
          `Workspace ${booking.workspaceId} not found when timing out booking ${booking._id}`
        );
      }
    }
  } catch (err) {
    console.error("Error timing out bookings:", err);
  }
};

//  Export everything
module.exports = {
  createBooking,
  getMyBookings,
  checkInBooking,
  cancelBooking,
  expireBookings,
  timeoutBookings,
};

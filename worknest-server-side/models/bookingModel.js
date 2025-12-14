const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // User who made the booking
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Desk or meeting room being booked
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    // Booking time range
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },

    // Booking lifecycle status
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "expired", "completed"],
      default: "confirmed",
    },

    // Temporary hold before confirmation (optional)
    hold: {
      expiresAt: { type: Date },
    },

    // Physical presence tracking
    check: {
      checkInAt: { type: Date },
      checkOutAt: { type: Date },
    },

    // External calendar integration (for meeting rooms)
    calendar: {
      provider: { type: String, enum: ["google"], default: "google" },
      eventId: { type: String },
      syncStatus: {
        type: String,
        enum: ["pending", "synced", "failed"],
        default: "pending",
      },
      syncedAt: { type: Date },
      lastError: { type: String },
    },

    // Admin or system actions
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cancellationReason: { type: String, trim: true },
  },
  { timestamps: true }
);

// Basic sanity check for time range
bookingSchema.pre("validate", function (next) {
  if (this.startAt && this.endAt && this.startAt >= this.endAt) {
    return next(new Error("Booking start time must be before end time"));
  }
  next();
});

// Indexes for fast availability checks and history views
bookingSchema.index({ userId: 1, startAt: -1 });
bookingSchema.index({ workspaceId: 1, startAt: 1, endAt: 1, status: 1 });

module.exports = mongoose.model("Booking", bookingSchema);

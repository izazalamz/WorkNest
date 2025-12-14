const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    // Employee this record belongs to
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Date stored as YYYY-MM-DD to avoid timezone issues
    day: { type: String, required: true },

    // Work mode for the day
    mode: { type: String, enum: ["office", "remote"], required: true },

    // Actual check-in and check-out times
    checkInAt: { type: Date },
    checkOutAt: { type: Date },

    // Cached total time worked (in minutes)
    totalMinutes: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// One attendance record per user per day
attendanceSchema.index({ userId: 1, day: 1 }, { unique: true });
attendanceSchema.index({ day: 1, mode: 1 });

// Automatically calculate totalMinutes when both times exist
attendanceSchema.pre("save", function (next) {
  if (this.checkInAt && this.checkOutAt && this.checkOutAt > this.checkInAt) {
    const diff = this.checkOutAt.getTime() - this.checkInAt.getTime();
    this.totalMinutes = Math.floor(diff / 60000);
  }
  next();
});

module.exports = mongoose.model("Attendance", attendanceSchema);

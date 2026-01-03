const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema(
  {
    // Display name like "Desk A1" or "Meeting Room 101"
    name: { type: String, required: true, trim: true },

    // Desk or meeting room
    type: { type: String, enum: ["desk", "meeting-room"], required: true },

    // Physical location details (useful for filters and maps)
    location: {
      building: { type: String, trim: true },
      floor: { type: String, trim: true },
      zone: { type: String, trim: true },
      description: { type: String, trim: true }, // e.g. "Near reception"
    },

    // Desks are usually 1, rooms can be more
    capacity: { type: Number, default: 1, min: 1 },

    // Optional features available in the workspace
    amenities: [{ type: String, trim: true }], // e.g. projector, whiteboard

    // Current availability state
    status: {
      type: String,
      enum: ["active", "maintenance", "inactive"],
      default: "active",
    },

    //booking start date & time
    startAt: {
      type: Date,
      default: null,
    },

    //booking end date & time
    endAt: {
      type: Date,
      default: null,
    },

    //  Google Calendar event 
    googleEventId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes to speed up common filters
workspaceSchema.index({ type: 1, status: 1 });
workspaceSchema.index({ "location.floor": 1, "location.zone": 1 });

module.exports = mongoose.model("Workspace", workspaceSchema);

const { Schema, model } = require("mongoose");

const NotificationSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["booking", "reminder", "alert", "general"],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    bookingId: {
      type: String,
      default: null,
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

const NotificationModel = model("notification", NotificationSchema);

module.exports = NotificationModel;

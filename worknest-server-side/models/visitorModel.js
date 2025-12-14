const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    // Employee the visitor is coming to see
    hostUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Admin who created the visitor entry
    createdByAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Visitor details
    fullName: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },

    // Expected visit window
    visitStartAt: { type: Date, required: true },
    visitEndAt: { type: Date, required: true },

    // Visitor approval and presence status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "checked_in", "checked_out"],
      default: "pending",
    },

    // Approval or rejection info
    approval: {
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      approvedAt: { type: Date },
      rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rejectedAt: { type: Date },
      rejectionReason: { type: String, trim: true },
    },

    // Email notification tracking (optional)
    emailStatus: {
      sentAt: { type: Date },
      status: {
        type: String,
        enum: ["pending", "sent", "failed"],
        default: "pending",
      },
      lastError: { type: String },
    },
  },
  { timestamps: true }
);

// Common query patterns
visitorSchema.index({ hostUserId: 1, visitStartAt: -1 });
visitorSchema.index({ status: 1, visitStartAt: -1 });

module.exports = mongoose.model("Visitor", visitorSchema);

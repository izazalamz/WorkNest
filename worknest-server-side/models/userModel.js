const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Firebase authentication UID
    uid: { type: String, required: true, unique: true, trim: true },

    // Primary user email
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Full name shown in the app
    name: { type: String, required: true, trim: true },

    // Optional company metadata
    companyName: { type: String, trim: true },
    department: { type: String, trim: true },

    // Access level
    role: { type: String, enum: ["admin", "employee"], default: "employee" },

    // Soft disable without deleting data
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes for lookups and permissions
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ uid: 1 }, { unique: true });
userSchema.index({ role: 1, isActive: 1 });

module.exports = mongoose.model("User", userSchema);

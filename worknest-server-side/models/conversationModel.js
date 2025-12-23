// models/conversationModel.js
const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "employee"],
          required: true,
        },
      },
    ],

    lastMessage: String,
    lastMessageAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);

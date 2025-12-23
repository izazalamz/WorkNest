const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");

const getOrCreateConversation = async (req, res) => {
  try {
    const { employeeUid, adminUid } = req.body;

    const employee = await User.findOne({ uid: employeeUid });
    const admin = await User.findOne({ uid: adminUid });

    if (!employee || !admin) {
      return res.status(404).json({ message: "User not found" });
    }

    let conversation = await Conversation.findOne({
      "participants.user": { $all: [employee._id, admin._id] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [
          { user: employee._id, role: "employee" },
          { user: admin._id, role: "admin" },
        ],
      });
    }

    res.status(200).json({ conversation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create conversation" });
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId }).sort({
      createdAt: 1,
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Message fetch error:", error);
    res.status(500).json({ message: "Failed to load messages" });
  }
};

const getAdminConversations = async (req, res) => {
  try {
    const { adminUid } = req.params;

    const conversations = await Conversation.find({
      "participants.role": "admin",
    })
      .populate("participants.user", "name photoURL email uid role")
      .sort({ lastMessageAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Admin conversations error:", error);
    res.status(500).json({ message: "Failed to load conversations" });
  }
};

module.exports = {
  getOrCreateConversation,
  getMessages,
  getAdminConversations,
};

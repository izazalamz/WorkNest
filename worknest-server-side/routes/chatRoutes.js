const express = require("express");
const router = express.Router();
const {
  getOrCreateConversation,
  getMessages,
  getAdminConversations,
} = require("../controllers/chatController");

router.get("/chat/admin/:adminUid", getAdminConversations);
router.post("/chat/conversation", getOrCreateConversation);
router.get("/chat/messages/:conversationId", getMessages);

module.exports = router;

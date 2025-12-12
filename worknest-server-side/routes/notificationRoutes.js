const express = require("express");
const {
  getNotifications,
  createNotification,
  markAsRead,
  deleteNotification,
  getUnreadCount,
} = require("../controllers/notificationController");

const router = express.Router();

router.get("/:userId", getNotifications);

router.post("/", createNotification);

router.put("/:id/read", markAsRead);

router.delete("/:id", deleteNotification);

router.get("/:userId/unread", getUnreadCount);

module.exports = router;

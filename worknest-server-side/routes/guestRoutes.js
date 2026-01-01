const express = require("express");
const router = express.Router();
const {
  submitGuestRequest,
  verifyGuestToken,
  checkGuestStatus,
  getPendingGuestRequests,
  getAllGuestRequests,
  approveGuestRequest,
  rejectGuestRequest,
} = require("../controllers/guestController");

// Public routes (no auth required)
router.post("/request", submitGuestRequest);
router.get("/verify/:token", verifyGuestToken);
router.get("/status/:email", checkGuestStatus);

// Admin routes (in production, add auth middleware)
router.get("/admin/pending", getPendingGuestRequests);
router.get("/admin/all", getAllGuestRequests);
router.patch("/admin/:id/approve", approveGuestRequest);
router.patch("/admin/:id/reject", rejectGuestRequest);

module.exports = router;
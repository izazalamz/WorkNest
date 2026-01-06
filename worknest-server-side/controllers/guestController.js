const Visitor = require("../models/visitorModel");
const { sendTemplatedEmail } = require("../utils/emailService");
const crypto = require("crypto");

// Generate unique access token
const generateAccessToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Submit guest request
const submitGuestRequest = async (req, res) => {
  try {
    const { fullName, email, company, phone } = req.body;

    // Validation
    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    // Check if guest already has a pending/approved request
    const existingGuest = await Visitor.findOne({
      email: email.toLowerCase(),
      status: { $in: ["pending", "approved", "checked_in"] },
    });

    if (existingGuest) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending or active guest request",
      });
    }

    // Create temporary admin ID (first admin in system)
    // In production, you might want to assign to a specific admin
    const User = require("../models/userModel");
    const adminUser = await User.findOne({ role: "admin" });

    if (!adminUser) {
      return res.status(500).json({
        success: false,
        message: "No admin found to process guest requests",
      });
    }

    // Set visit window (24 hours from now for demo purposes)
    const visitStartAt = new Date();
    const visitEndAt = new Date();
    visitEndAt.setHours(visitEndAt.getHours() + 48); // 48 hour access window

    // Create guest request
    const guest = await Visitor.create({
      hostUserId: adminUser._id, // Assign to admin for guest mode
      createdByAdminId: adminUser._id,
      fullName,
      email: email.toLowerCase(),
      company: company || "",
      phone: phone || "",
      visitStartAt,
      visitEndAt,
      status: "pending",
      isGuestMode: true,
    });

    // Send waiting list email
    try {
      await sendTemplatedEmail(email, "guestWaitingList", {
        name: fullName,
        email: email,
      });

      // Update email status
      guest.emailStatus = {
        sentAt: new Date(),
        status: "sent",
      };
      await guest.save();
    } catch (emailError) {
      console.error("Error sending waiting list email:", emailError.message);
      guest.emailStatus = {
        sentAt: new Date(),
        status: "failed",
        lastError: emailError.message,
      };
      await guest.save();
    }

    res.status(201).json({
      success: true,
      message:
        "Guest request submitted successfully! Check your email for updates.",
      guest: {
        id: guest._id,
        fullName: guest.fullName,
        email: guest.email,
        status: guest.status,
      },
    });
  } catch (error) {
    console.error("Error submitting guest request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit guest request",
      error: error.message,
    });
  }
};

// Verify guest access token
const verifyGuestToken = async (req, res) => {
  try {
    const { token } = req.params;

    console.log("🔍 Verifying token:", token);

    const guest = await Visitor.findOne({
      accessToken: token,
      isGuestMode: true,
    });

    console.log("📄 Guest found:", guest ? "Yes" : "No");
    if (guest) {
      console.log("📊 Guest status:", guest.status);
      console.log("⏰ Token expiry:", guest.tokenExpiry);
    }

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired guest access token",
      });
    }

    // Check status - allow both "approved" and "checked_in" to access demo
    if (guest.status !== "approved" && guest.status !== "checked_in") {
      return res.status(403).json({
        success: false,
        message: `Guest access is ${guest.status}. Please contact admin.`,
      });
    }

    // Check if token is expired
    if (guest.tokenExpiry && new Date() > guest.tokenExpiry) {
      return res.status(403).json({
        success: false,
        message: "Guest access token has expired",
      });
    }

    // Update status to checked_in only if it was "approved"
    if (guest.status === "approved") {
      guest.status = "checked_in";
      await guest.save();
    }

    console.log(" Guest verified successfully");

    res.status(200).json({
      success: true,
      message: "Guest access verified",
      guest: {
        id: guest._id,
        fullName: guest.fullName,
        email: guest.email,
        company: guest.company,
        accessExpiresAt: guest.tokenExpiry,
      },
    });
  } catch (error) {
    console.error("Error verifying guest token:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify guest token",
      error: error.message,
    });
  }
};

// Check guest status by email
const checkGuestStatus = async (req, res) => {
  try {
    const { email } = req.params;

    const guest = await Visitor.findOne({
      email: email.toLowerCase(),
      isGuestMode: true,
    }).sort({ createdAt: -1 });

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "No guest request found for this email",
      });
    }

    res.status(200).json({
      success: true,
      guest: {
        id: guest._id,
        fullName: guest.fullName,
        email: guest.email,
        status: guest.status,
        createdAt: guest.createdAt,
        accessToken: guest.status === "approved" ? guest.accessToken : null,
      },
    });
  } catch (error) {
    console.error("Error checking guest status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check guest status",
      error: error.message,
    });
  }
};

// Admin: Get all pending guest requests
const getPendingGuestRequests = async (req, res) => {
  try {
    const pendingGuests = await Visitor.find({
      status: "pending",
      isGuestMode: true,
    })
      .sort({ createdAt: -1 })
      .select("-accessToken"); // Don't expose tokens

    res.status(200).json({
      success: true,
      count: pendingGuests.length,
      guests: pendingGuests,
    });
  } catch (error) {
    console.error("Error fetching pending guests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending guest requests",
      error: error.message,
    });
  }
};

// Admin: Get all guest requests (with filters)
const getAllGuestRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { isGuestMode: true };

    if (status) {
      filter.status = status;
    }

    const guests = await Visitor.find(filter)
      .sort({ createdAt: -1 })
      .select("-accessToken");

    res.status(200).json({
      success: true,
      count: guests.length,
      guests,
    });
  } catch (error) {
    console.error("Error fetching guest requests:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch guest requests",
      error: error.message,
    });
  }
};

// Admin: Approve guest request
const approveGuestRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body; // Admin Firebase UID

    const guest = await Visitor.findById(id);

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Guest request not found",
      });
    }

    if (guest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Guest request is already ${guest.status}`,
      });
    }

    // Get admin's MongoDB _id from Firebase UID
    const User = require("../models/userModel");
    const adminUser = await User.findOne({ uid: adminId });

    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found",
      });
    }

    // Generate access token
    const accessToken = generateAccessToken();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 48); // 48 hour access

    console.log("🔑 Generated token:", accessToken);

    // Update guest record
    guest.status = "approved";
    guest.accessToken = accessToken;
    guest.tokenExpiry = tokenExpiry;
    guest.approval = {
      approvedBy: adminUser._id, // Use MongoDB _id, not Firebase UID
      approvedAt: new Date(),
    };

    await guest.save();

    console.log(" Guest saved with token:", guest.accessToken);

    // Send approval email with demo dashboard link
    try {
      const demoUrl = `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/guest-verify/${accessToken}`;

      console.log("📧 Sending email with URL:", demoUrl);

      await sendTemplatedEmail(guest.email, "guestApproved", {
        name: guest.fullName,
        demoUrl,
        expiryHours: 48,
      });

      guest.emailStatus = {
        sentAt: new Date(),
        status: "sent",
      };
      await guest.save();
    } catch (emailError) {
      console.error("Error sending approval email:", emailError.message);
      guest.emailStatus = {
        sentAt: new Date(),
        status: "failed",
        lastError: emailError.message,
      };
      await guest.save();
    }

    res.status(200).json({
      success: true,
      message: "Guest request approved successfully",
      guest: {
        id: guest._id,
        fullName: guest.fullName,
        email: guest.email,
        status: guest.status,
        accessExpiresAt: guest.tokenExpiry,
      },
    });
  } catch (error) {
    console.error("Error approving guest request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve guest request",
      error: error.message,
    });
  }
};

// Admin: Reject guest request
const rejectGuestRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, rejectionReason } = req.body;

    const guest = await Visitor.findById(id);

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Guest request not found",
      });
    }

    if (guest.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Guest request is already ${guest.status}`,
      });
    }

    // Get admin's MongoDB _id from Firebase UID
    const User = require("../models/userModel");
    const adminUser = await User.findOne({ uid: adminId });

    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found",
      });
    }

    // Update guest record
    guest.status = "rejected";
    guest.approval = {
      rejectedBy: adminUser._id, // Use MongoDB _id, not Firebase UID
      rejectedAt: new Date(),
      rejectionReason: rejectionReason || "Not specified",
    };

    await guest.save();

    // Send rejection email
    try {
      await sendTemplatedEmail(guest.email, "guestRejected", {
        name: guest.fullName,
        reason:
          rejectionReason || "Your request could not be approved at this time",
      });

      guest.emailStatus = {
        sentAt: new Date(),
        status: "sent",
      };
      await guest.save();
    } catch (emailError) {
      console.error("Error sending rejection email:", emailError.message);
      guest.emailStatus = {
        sentAt: new Date(),
        status: "failed",
        lastError: emailError.message,
      };
      await guest.save();
    }

    res.status(200).json({
      success: true,
      message: "Guest request rejected",
      guest: {
        id: guest._id,
        fullName: guest.fullName,
        email: guest.email,
        status: guest.status,
      },
    });
  } catch (error) {
    console.error("Error rejecting guest request:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reject guest request",
      error: error.message,
    });
  }
};

module.exports = {
  submitGuestRequest,
  verifyGuestToken,
  checkGuestStatus,
  getPendingGuestRequests,
  getAllGuestRequests,
  approveGuestRequest,
  rejectGuestRequest,
};

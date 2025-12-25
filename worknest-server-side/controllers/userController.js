const User = require("../models/userModel");
const { sendTemplatedEmail } = require("../utils/emailService");

const getUser = async (req, res) => {
  try {
    const allUsers = await User.find();
    if (!allUsers || allUsers.length === 0) {
      return res.json({
        message: "There is no user.",
      });
    }
    res.status(200).json({
      success: true,
      user: allUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

const getSingleUser = async (req, res) => {
  try {
    const { uid } = req.params;
    const singleUser = await User.findOne({ uid });

    if (!singleUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
<<<<<<< HEAD
      user: singleUser,
=======
      users: singleUser,
>>>>>>> f7782b38bedf3693ff050e7f2017583de336f85f
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

const createUser = async (req, res) => {
  try {
    const {
      uid,
      name,
      email,
      role = "employee",
      department,
      companyName,
      photoURL,
      profileCompleted = false,
    } = req.body;

    // Validation
    if (!uid || !email) {
      return res.status(400).json({
        success: false,
        message: "UID and email are required",
      });
    }

    // Check if this is a new user or an update
    const existingUser = await User.findOne({ uid });
    const isNewUser = !existingUser;

    const user = await User.findOneAndUpdate(
      { uid },
      {
        uid,
        name,
        email,
        role,
        department,
        companyName,
        photoURL,
        profileCompleted,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    // Send welcome email only for new users
    if (isNewUser) {
      try {
        const loginUrl = `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/login`;

        await sendTemplatedEmail(user.email, "welcomeEmail", {
          name: user.name || user.email,
          loginUrl: loginUrl,
        });

        console.log(`Welcome email sent to ${user.email}`);
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError.message);
        // Note: We don't fail the user creation if email sending fails
        // The user is still created successfully
      }
    }

    res.status(200).json({
      success: true,
      user,
      message: isNewUser
        ? "User created successfully"
        : "User updated successfully",
    });
  } catch (error) {
    console.error("Error creating/updating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create or update user",
      error: error.message,
    });
  }
};

const getUserRoleByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      role: user.role,
      user,
    });
  } catch (error) {
    console.error("Error fetching user role:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user role",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { uid } = req.params;
    const {
      name,
      companyName,
      department,
      role,
      isActive,
      photoURL,
      profileCompleted,
    } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { uid },
      {
        name,
        companyName,
        department,
        role,
        isActive,
        photoURL,
        profileCompleted,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found, cannot be deleted!",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully!",
      user: deletedUser,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting user",
    });
  }
};

// get admin id
const getAdminUser = async (req, res) => {
  try {
    const admin = await User.findOne({ role: "admin", isActive: true });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getUser,
  getUserRoleByEmail,
  getSingleUser,
  createUser,
  updateUser,
  deleteUser,
  getAdminUser,
<<<<<<< HEAD
};
=======
};
>>>>>>> f7782b38bedf3693ff050e7f2017583de336f85f

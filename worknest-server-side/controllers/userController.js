const User = require("../models/userModel");

// get all users list
const getUser = async (req, res) => {
  try {
    const allUsers = await User.find();
    if (!allUsers || allUsers.length === 0) {
      res.json({
        message: "There is no user.",
      });
    }
    res.status(200).json({
      success: true,
      users: allUsers,
    });
  } catch (error) {
    console.log(error);
  }
};

// get single user's details
const getSingleUser = async (req, res) => {
  try {
    const { uid } = req.params;
    const singleUser = await User.findOne({ uid });
    res.status(200).json({
      users: singleUser,
    });
  } catch (error) {
    console.log(error);
  }
};

// create and post a new user to DB
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

    const user = await User.findOneAndUpdate(
      { uid }, // search condition
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
        upsert: true, // create if not exists
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create or update user",
    });
  }
};

// get user role by email
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
    console.log(error);
  }
};

// update user's info by id
const updateUser = async (req, res) => {
  try {
    const { uid } = req.params;
    const { name, companyName, department, role, isActive, photoURL } =
      req.body;
    const updatedUser = await User.findOneAndUpdate(
      { uid },
      { name, companyName, department, role, isActive, photoURL },
      { new: true }
    );
    res.status(200).json({
      users: updatedUser,
    });
  } catch (error) {
    console.log(error);
  }
};

// delete a user by id from DB
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
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting user",
    });
  }
};

module.exports = {
  getUser,
  getUserRoleByEmail,
  getSingleUser,
  createUser,
  updateUser,
  deleteUser,
};

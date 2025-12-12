const express = require("express");
const router = express.Router();
const {
  getUser,
  getUserRoleByEmail,
  getSingleUser,
  updateUser,
  createUser,
  deleteUser,
} = require("../controllers/userController");

router.get("/users", getUser);

router.get("/users/role/:email", getUserRoleByEmail);

router.get("/users/:uid", getSingleUser);

router.post("/users", createUser);

router.put("/users/:id", updateUser);

router.delete("/users/:id", deleteUser);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getUser,
  getUserRoleByEmail,
  getSingleUser,
  updateUser,
  createUser,
  deleteUser,
  getAdminUser,
} = require("../controllers/userController");

router.get("/users/admin", getAdminUser); // get admin

router.get("/users", getUser);

router.get("/users/role/:email", getUserRoleByEmail);

router.get("/users/:uid", getSingleUser);

router.post("/users", createUser);

router.put("/users/:uid", updateUser);

router.delete("/users/:id", deleteUser);

module.exports = router;

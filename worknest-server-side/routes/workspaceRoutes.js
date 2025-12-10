const express = require("express");
const router = express.Router();
const {
  createWorkspace,
  getAllWorkspaces,
} = require("../controllers/workspaceController");

router.post("/workspace", createWorkspace);

// get all workspaces
router.get("/workspaces", getAllWorkspaces);

module.exports = router;

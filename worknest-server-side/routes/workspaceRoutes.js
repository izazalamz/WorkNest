const express = require("express");
const router = express.Router();
const {
  getAllWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
} = require("../controllers/workspaceController");

router.get("/workspace", getAllWorkspaces);
router.post("/workspace", createWorkspace);
router.put("/workspace/:id", updateWorkspace);
router.delete("/workspace/:id", deleteWorkspace);

module.exports = router;

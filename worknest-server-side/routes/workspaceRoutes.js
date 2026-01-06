const express = require("express");
const router = express.Router();
const {
  getAllWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  updateWorkspaceStatus, // 👈 add this
} = require("../controllers/workspaceController");

router.get("/workspace", getAllWorkspaces);
router.post("/workspace", createWorkspace);
router.put("/workspace/:id", updateWorkspace);
router.delete("/workspace/:id", deleteWorkspace);

//  UPDATE workspace status 
router.patch("/workspace/:id/status", updateWorkspaceStatus);

module.exports = router;

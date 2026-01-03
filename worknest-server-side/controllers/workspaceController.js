const Workspace = require("../models/workspaceModel");

// ✅ Create a new workspace
const createWorkspace = async (req, res) => {
  try {
    const {
      name,
      type,
      location, 
      capacity,
      amenities,
      status,
    } = req.body;

    // Basic validation
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: "Workspace name and type are required",
      });
    }

    const newWorkspace = new Workspace({
      name,
      type,
      location: {
        building: location?.building,
        floor: location?.floor,
        zone: location?.zone,
        description: location?.description,
      },
      capacity: capacity || 1,
      amenities: amenities || [],
      status: status || "active",
    });

    console.log("this is workspace", newWorkspace);
    await newWorkspace.save();

    res.status(200).json({
      workspace: newWorkspace,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create workspace" });
  }
};

// ✅ Get all workspaces
const getAllWorkspaces = async (req, res) => {
  try {
    const allWorkspaces = await Workspace.find();
    res.status(200).json({
      success: true,
      workspaces: allWorkspaces,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to fetch workspaces" });
  }
};

// ✅ Update workspace status + startAt/endAt/Google event
const updateWorkspaceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, startAt, endAt, googleEventId } = req.body; // added startAt, endAt, googleEventId

    const updatedWorkspace = await Workspace.findByIdAndUpdate(
      id,
      { status, startAt, endAt, googleEventId }, // update all fields
      { new: true }
    );

    if (!updatedWorkspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    res.status(200).json({
      success: true,
      workspace: updatedWorkspace,
    });
  } catch (error) {
    console.error("Update workspace error:", error);
    res.status(500).json({ message: "Failed to update workspace status" });
  }
};

module.exports = {
  createWorkspace,
  getAllWorkspaces,
  updateWorkspace,
  deleteWorkspace,
  updateWorkspaceStatus,
};

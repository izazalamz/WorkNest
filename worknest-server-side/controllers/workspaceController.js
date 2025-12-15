const Workspace = require("../models/workspaceModel");

const createWorkspace = async (req, res) => {
  try {
    const {
      name,
      type,
      location, // { building, floor, zone, description }
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

    await newWorkspace.save();

    res.status(201).json({
      success: true,
      message: "Workspace created successfully",
      workspace: newWorkspace,
    });
  } catch (error) {
    console.error("Create workspace error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create workspace",
    });
  }
};

// get all workspaces list
const getAllWorkspaces = async (req, res) => {
  try {
    const allWorkspaces = await Workspace.find();
    res.status(200).json({
      success: true,
      workspaces: allWorkspaces,
    });
  } catch (error) {
    console.log(error);
  }
};

// Update workspace
const updateWorkspace = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedWorkspace = await Workspace.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.status(200).json({ workspace: updatedWorkspace });
  } catch (error) {
    res.status(400).json({ message: "Failed to update workspace" });
  }
};

// Delete workspace
const deleteWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    await Workspace.findByIdAndDelete(id);
    res.status(200).json({ message: "Workspace deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete workspace" });
  }
};

module.exports = {
  createWorkspace,
  getAllWorkspaces,
  updateWorkspace,
  deleteWorkspace,
};

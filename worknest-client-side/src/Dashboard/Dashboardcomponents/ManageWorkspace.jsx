import { useEffect, useState } from "react";
import axios from "axios";
import {
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Filter,
  Plus,
  Building2,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
} from "lucide-react";
import { Link } from "react-router";
import Loading from "../../components/Loading";

const ManageWorkspace = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const res = await axios.get("http://localhost:3000/dashboard/workspace");
      setWorkspaces(res.data.workspaces);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (workspace) => {
    setSelectedWorkspace(workspace);
    setFormData({
      name: workspace.name,
      type: workspace.type,
      capacity: workspace.capacity,
      status: workspace.status,
      amenities: workspace.amenities?.join(", "),
      building: workspace.location?.building || "",
      floor: workspace.location?.floor || "",
      zone: workspace.location?.zone || "",
      description: workspace.location?.description || "",
    });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:3000/dashboard/workspace/${selectedWorkspace._id}`,
        {
          name: formData.name,
          type: formData.type,
          capacity: Number(formData.capacity),
          status: formData.status,
          amenities: formData.amenities.split(",").map((a) => a.trim()),
          location: {
            building: formData.building,
            floor: formData.floor,
            zone: formData.zone,
            description: formData.description,
          },
        }
      );
      setSelectedWorkspace(null);
      fetchWorkspaces();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this workspace?")) return;
    try {
      await axios.delete(`http://localhost:3000/dashboard/workspace/${id}`);
      fetchWorkspaces();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "maintenance":
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "meeting-room":
        return <Building2 className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const filteredWorkspaces = workspaces.filter((ws) => {
    const matchesSearch =
      ws.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ws.location?.building.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || ws.type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Manage Workspaces
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage all workspaces in your organization
          </p>
        </div>
        <Link to={"/dashboard/add-workspace"}>
          <button className="btn btn-primary gap-2">
            <Plus size={18} />
            Add Workspace
          </button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Workspaces</p>
              <p className="text-2xl font-bold text-foreground">
                {workspaces.length}
              </p>
            </div>
            <Building2 className="w-8 h-8 text-primary/60" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="text-2xl font-bold text-foreground">
                {workspaces.filter((w) => w.status === "active").length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-success/60" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Meeting Rooms</p>
              <p className="text-2xl font-bold text-foreground">
                {workspaces.filter((w) => w.type === "meeting-room").length}
              </p>
            </div>
            <Users className="w-8 h-8 text-secondary/60" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Maintenance</p>
              <p className="text-2xl font-bold text-foreground">
                {workspaces.filter((w) => w.status === "maintenance").length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-warning/60" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search workspaces..."
              className="w-full pl-10 pr-4 py-2 bg-muted  rounded-lg focus:ring-2 focus:ring-primary/50 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 bg-muted focus:ring-2 focus:ring-primary/50 outline-none rounded-lg"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="desk">Desks</option>
              <option value="meeting-room">Meeting Rooms</option>
            </select>
          </div>
        </div>
      </div>

      {/* Workspace Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 text-left font-medium">Workspace</th>
                <th className="p-4 text-left font-medium">Type</th>
                <th className="p-4 text-left font-medium">Location</th>
                <th className="p-4 text-left font-medium">Capacity</th>
                <th className="p-4 text-left font-medium">Status</th>
                <th className="p-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkspaces.map((ws) => (
                <tr
                  key={ws._id}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        {getTypeIcon(ws.type)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{ws.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {ws.amenities?.slice(0, 2).join(", ")}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {ws.type === "meeting-room" ? (
                      <span className="capitalize px-3 py-1 bg-secondary/30 rounded-full text-sm">
                        Meeting Room
                      </span>
                    ) : (
                      <span className="capitalize px-3 py-1 bg-accent/30 rounded-full text-sm">
                        Desk
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-foreground">
                        {ws.location?.building}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Floor {ws.location?.floor}, Zone {ws.location?.zone}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{ws.capacity}</span>
                      <span className="text-sm text-muted-foreground">
                        people
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-full ${
                          ws.status === "active"
                            ? "bg-success/10 text-success"
                            : ws.status === "maintenance"
                            ? "bg-warning/10 text-warning"
                            : "bg-error/10 text-error"
                        }`}
                      >
                        {getStatusIcon(ws.status)}
                      </div>
                      <span className="capitalize">{ws.status}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(ws)}
                        className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(ws._id)}
                        className="p-2 hover:bg-error/10 rounded-lg text-error transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredWorkspaces.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-medium text-foreground mb-2">
              No workspaces found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {selectedWorkspace && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-card rounded-xl w-full max-w-2xl my-8 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Edit Workspace
                </h2>
                <p className="text-muted-foreground mt-1">
                  Update workspace details
                </p>
              </div>
              <button
                onClick={() => setSelectedWorkspace(null)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Workspace Name
                  </label>
                  <input
                    className="w-full px-4 py-2 bg-muted outline-none rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                    placeholder="Enter workspace name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Type
                  </label>
                  <select
                    className="w-full px-4 py-2 bg-muted outline-none rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    <option value="desk">Desk</option>
                    <option value="meeting-room">Meeting Room</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Capacity
                  </label>
                  <input
                    className="w-full px-4 py-2 bg-muted outline-none rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                    placeholder="Enter capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Status
                  </label>
                  <select
                    className="w-full px-4 py-2 bg-muted outline-none rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Amenities
                  </label>
                  <input
                    className="w-full px-4 py-2 bg-muted outline-none rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                    placeholder="Monitor, Whiteboard, Conference Phone (comma separated)"
                    value={formData.amenities}
                    onChange={(e) =>
                      setFormData({ ...formData, amenities: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Building
                  </label>
                  <input
                    className="w-full px-4 py-2 bg-muted outline-none rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                    placeholder="Building name"
                    value={formData.building}
                    onChange={(e) =>
                      setFormData({ ...formData, building: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Floor
                  </label>
                  <input
                    className="w-full px-4 py-2 bg-muted outline-none rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                    placeholder="Floor number"
                    value={formData.floor}
                    onChange={(e) =>
                      setFormData({ ...formData, floor: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Zone
                  </label>
                  <input
                    className="w-full px-4 py-2 bg-muted outline-none rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                    placeholder="Zone/Area"
                    value={formData.zone}
                    onChange={(e) =>
                      setFormData({ ...formData, zone: e.target.value })
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full px-4 py-2 bg-muted outline-none rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-transparent resize-none"
                    placeholder="Workspace description and notes..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-border flex-shrink-0">
              <button
                onClick={() => setSelectedWorkspace(null)}
                className="px-6 py-2.5 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button onClick={handleUpdate} className="btn btn-primary gap-2">
                <Save size={18} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageWorkspace;

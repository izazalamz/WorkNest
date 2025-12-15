import { useState } from "react";
import {
  Building2,
  Layers,
  MapPin,
  Users,
  Wrench,
  Plus,
  X,
} from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router";

const AddWorkspace = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [amenityInput, setAmenityInput] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    type: "desk",
    capacity: 1,
    status: "active",
    amenities: [],
    location: {
      building: "",
      floor: "",
      zone: "",
      description: "",
    },
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      location: { ...prev.location, [field]: value },
    }));
  };

  const addAmenity = () => {
    if (!amenityInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      amenities: [...prev.amenities, amenityInput.trim()],
    }));
    setAmenityInput("");
  };

  const removeAmenity = (index) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.type) {
      setError("Workspace name and type are required.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:3000/dashboard/workspace", formData);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to create workspace. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-card outline-none rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Add Workspace
        </h1>
        <p className="text-muted-foreground mb-8">
          Create a new desk or meeting room for your office.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Workspace Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  className="w-full pl-12 h-12 rounded-lg outline-none bg-background focus:ring-2 focus:ring-primary/50"
                  placeholder="Desk A1 / Meeting Room 101"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Workspace Type
              </label>
              <select
                className="w-full h-12 rounded-lg outline-none bg-background focus:ring-2 focus:ring-primary/50 px-4"
                value={formData.type}
                onChange={(e) => handleChange("type", e.target.value)}
              >
                <option value="desk">Desk</option>
                <option value="meeting-room">Meeting Room</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Location Details
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <input
                className="h-12 rounded-lg outline-none bg-background focus:ring-2 focus:ring-primary/50 px-4"
                placeholder="Building"
                value={formData.location.building}
                onChange={(e) =>
                  handleLocationChange("building", e.target.value)
                }
              />
              <input
                className="h-12 rounded-lg outline-none bg-background focus:ring-2 focus:ring-primary/50 px-4"
                placeholder="Floor"
                value={formData.location.floor}
                onChange={(e) => handleLocationChange("floor", e.target.value)}
              />
              <input
                className="h-12 rounded-lg outline-none bg-background focus:ring-2 focus:ring-primary/50 px-4"
                placeholder="Zone"
                value={formData.location.zone}
                onChange={(e) => handleLocationChange("zone", e.target.value)}
              />
              <input
                className="h-12 rounded-lg outline-none bg-background focus:ring-2 focus:ring-primary/50 px-4"
                placeholder="Description (optional)"
                value={formData.location.description}
                onChange={(e) =>
                  handleLocationChange("description", e.target.value)
                }
              />
            </div>
          </div>

          {/* Capacity & Status */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium mb-1 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Capacity
              </label>
              <input
                type="number"
                min={1}
                className="w-full h-12 rounded-lg outline-none bg-background focus:ring-2 focus:ring-primary/50 px-4"
                value={formData.capacity}
                onChange={(e) =>
                  handleChange("capacity", Number(e.target.value))
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Status
              </label>
              <select
                className="w-full h-12 rounded-lg outline-none bg-background focus:ring-2 focus:ring-primary/50 px-4"
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
              >
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="text-sm font-medium mb-2 block">Amenities</label>
            <div className="flex gap-3 mb-3">
              <input
                className="flex-1 h-12 rounded-lg outline-none bg-background focus:ring-2 focus:ring-primary/50 px-4"
                placeholder="e.g. Projector, Whiteboard"
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
              />
              <button
                type="button"
                onClick={addAmenity}
                className="h-12 px-4 rounded-lg bg-primary text-white hover:bg-primary/90"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((item, index) => (
                <span
                  key={index}
                  className="flex items-center gap-2 px-3 py-1 rounded-full  bg-muted text-sm"
                >
                  {item}
                  <button type="button" onClick={() => removeAmenity(index)}>
                    <X className="w-4 h-4 text-muted-foreground hover:text-error" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition"
          >
            {loading ? "Creating..." : "Create Workspace"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default AddWorkspace;

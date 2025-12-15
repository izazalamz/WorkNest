import { useContext, useEffect, useState } from "react";
import { User, Building2, Briefcase, Camera, Save } from "lucide-react";
import axios from "axios";
import { AuthContext } from "../../contexts/AuthContext";

const Profile = () => {
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    department: "",
    role: "employee",
    photoURL: "",
  });

  // Fetch user data
  useEffect(() => {
    if (!user?.uid) return;

    axios
      .get(`http://localhost:3000/users/${user.uid}`)
      .then((res) => {
        const u = res.data.users;
        setFormData({
          name: u.name || "",
          companyName: u.companyName || "",
          department: u.department || "",
          role: u.role || "employee",
          photoURL: u.photoURL || "",
        });
      })
      .catch(() => setError("Failed to load profile"));
  }, [user]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`http://localhost:3000/users/${user.uid}`, formData);
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information and preferences
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="rounded-lg border border-error/20 bg-error/10 p-4 text-error text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-success/20 bg-success/10 p-4 text-success text-sm">
            {success}
          </div>
        )}

        {/* Profile Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Avatar Section */}
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <div className="relative mx-auto w-32 h-32 rounded-full overflow-hidden border">
              {formData.photoURL ? (
                <img
                  src={formData.photoURL}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-4xl font-semibold text-muted-foreground">
                  {formData.name?.charAt(0) || "U"}
                </div>
              )}

              <div className="absolute bottom-0 right-0 bg-primary p-2 rounded-full">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </div>

            <input
              type="text"
              placeholder="Photo URL"
              value={formData.photoURL}
              onChange={(e) => handleChange("photoURL", e.target.value)}
              className="mt-4 w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:ring-2 focus:ring-primary/40 outline-none"
            />

            <p className="mt-2 text-xs text-muted-foreground">
              Paste a public image URL
            </p>
          </div>

          {/* Form Section */}
          <div className="md:col-span-2 bg-card border border-border rounded-xl p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="text-sm font-medium text-foreground">
                  Full Name
                </label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/40 outline-none"
                  />
                </div>
              </div>

              {/* Company */}
              <div>
                <label className="text-sm font-medium text-foreground">
                  Company Name
                </label>
                <div className="relative mt-1">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) =>
                      handleChange("companyName", e.target.value)
                    }
                    className="w-full h-12 pl-10 pr-4 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/40 outline-none"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="text-sm font-medium text-foreground">
                  Department
                </label>
                <div className="relative mt-1">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/40 outline-none"
                  />
                </div>
              </div>

              {/* Role (read-only unless admin logic added) */}
              <div>
                <label className="text-sm font-medium text-foreground">
                  Role
                </label>
                <input
                  disabled
                  value={formData.role}
                  className="w-full h-12 rounded-lg border border-border bg-muted px-4 text-sm text-muted-foreground"
                />
              </div>

              {/* Save */}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full h-12 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;

import { useState, useContext } from "react";
import { Building2, User, Briefcase } from "lucide-react";
import { useNavigate } from "react-router";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";

const CompleteProfile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    department: "",
    role: "employee",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.companyName) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        uid: user.uid,
        email: user.email,
        name: formData.name,
        companyName: formData.companyName,
        department: formData.department,
        role: "employee",
        profileCompleted: true,
      };

      await axios.post("https://worknest-u174.onrender.com/users", payload);

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to complete profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 shadow-xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Complete Your Profile
          </h1>
          <p className="mt-2 text-muted-foreground">
            This information helps us personalize your WorkNest experience.
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                className="w-full h-14 pl-12 pr-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/40 outline-none"
                placeholder="Your full name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Company Name *
            </label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <select
                className="w-full h-14 pl-12 pr-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/40 outline-none appearance-none"
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                required
              >
                <option value="">Select your company</option>
                <option value="Brain Station 23">Brain Station 23</option>
                <option value="TigerIT Bangladesh">TigerIT Bangladesh</option>
                <option value="Southtech Group">Southtech Group</option>
                <option value="Therap (BD) Ltd">Therap (BD) Ltd</option>
                <option value="BJIT Group">BJIT Group</option>
                <option value="Reve Systems">Reve Systems</option>
                <option value="LeadSoft Bangladesh">LeadSoft Bangladesh</option>
                <option value="Kaz Software">Kaz Software</option>
                <option value="Enosis Solutions">Enosis Solutions</option>
                <option value="Dynamic Solution Innovators (DSi)">
                  Dynamic Solution Innovators (DSi)
                </option>
              </select>
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Department (optional)
            </label>
            <select
              className="w-full h-14 px-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/40 outline-none"
              value={formData.department}
              onChange={(e) => handleChange("department", e.target.value)}
            >
              <option value="">Select department</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Design">Design</option>
              <option value="Quality Assurance">Quality Assurance (QA)</option>
              <option value="DevOps">DevOps</option>
              <option value="Human Resources">Human Resources (HR)</option>
              <option value="Sales & Marketing">Sales & Marketing</option>
              <option value="Customer Support">Customer Support</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg hover:bg-primary/90 transition flex items-center justify-center"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 mr-2 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Saving...
              </>
            ) : (
              "Complete Profile"
            )}
          </button>
        </form>
      </div>
    </section>
  );
};

export default CompleteProfile;

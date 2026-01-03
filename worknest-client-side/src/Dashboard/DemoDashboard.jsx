import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Sun,
  MapPin,
  Calendar,
  Users,
  Building2,
  ArrowRight,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

const DemoDashboard = () => {
  const navigate = useNavigate();
  const [guestData, setGuestData] = useState(null);

  useEffect(() => {
    // Check if user is in guest mode
    const isGuestMode = sessionStorage.getItem("guestMode");
    const storedGuestData = sessionStorage.getItem("guestData");

    if (!isGuestMode || !storedGuestData) {
      navigate("/guest-request");
      return;
    }

    setGuestData(JSON.parse(storedGuestData));
  }, [navigate]);

  if (!guestData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      {/* Demo Mode Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Demo Mode Active</p>
            <p className="text-sm opacity-90">
              You're viewing sample data. Some features are read-only in demo mode.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {greeting}, {guestData.fullName}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome to the WorkNest Demo Dashboard
          </p>
        </div>

        <div className="py-2 px-4 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
          Guest User
        </div>
      </div>

      {/* Weather Card */}
      <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <Sun className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Today's Weather · 24°C</p>
          <p className="font-medium text-foreground">
            ☀️ Perfect weather! Great day to work from the office.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={MapPin} label="Available Desks" value="12" />
        <StatCard icon={Calendar} label="Demo Bookings" value="3" />
        <StatCard icon={Users} label="Team in Office" value="24" />
        <StatCard icon={Building2} label="Meeting Rooms" value="8" />
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Demo Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DemoFeature
            title="Desk Booking System"
            description="Interactive workspace reservation with real-time availability"
            icon={MapPin}
          />

          <DemoFeature
            title="Meeting Room Scheduler"
            description="Schedule meetings with calendar integration"
            icon={Calendar}
          />

          <DemoFeature
            title="Team Collaboration"
            description="See who's in the office and coordinate with your team"
            icon={Users}
          />

          <DemoFeature
            title="Analytics Dashboard"
            description="Track workspace utilization and booking patterns"
            icon={Building2}
          />
        </div>
      </div>

      {/* Sample Data Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          About This Demo
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• All data shown is sample/mock data for demonstration purposes</li>
          <li>• You have read-only access to explore the features</li>
          <li>• Your demo session expires: {guestData.accessExpiresAt ? new Date(guestData.accessExpiresAt).toLocaleString() : 'Soon'}</li>
          <li>• Ready to get started with WorkNest? Contact us for a full account!</li>
        </ul>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to Transform Your Workspace?</h2>
        <p className="text-white/90 mb-6">
          Get full access to all WorkNest features with a free trial
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/signup")}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            <span>Start Free Trial</span>
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoDashboard;

/* ---------------- Components ---------------- */

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition">
    <div className="flex items-center justify-between mb-3">
      <div className="p-3 bg-primary/10 rounded-lg">
        <Icon className="w-5 h-5 text-primary" />
      </div>
    </div>
    <p className="text-2xl font-bold text-foreground">{value}</p>
    <p className="text-sm text-muted-foreground">{label}</p>
  </div>
);

const DemoFeature = ({ title, description, icon: Icon }) => (
  <div className="flex items-start gap-4 p-5 border border-border rounded-lg bg-card/50">
    <div className="p-3 bg-primary/10 rounded-lg">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <div className="text-muted-foreground">
      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">Demo</span>
    </div>
  </div>
);
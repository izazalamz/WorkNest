import { useEffect, useState, use } from "react";
import {
  Sun,
  CloudRain,
  Cloud,
  MapPin,
  Calendar,
  Users,
  Building2,
  ArrowRight,
} from "lucide-react";
import axios from "axios";
import { Link } from "react-router";
import { AuthContext } from "../contexts/AuthContext";
import useUserRole from "../hooks/useUserRole";
import Loading from "../components/Loading";
import WeatherWidget from "./Dashboardcomponents/WeatherWidget";

const DashboardHome = () => {
  const { user } = use(AuthContext);
  const { role } = useUserRole();
  const [userData, setUserData] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const uid = user?.uid;

  // greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    if (!uid) return;

    const fetchData = async () => {
      try {
        const userRes = await axios.get(`http://localhost:3000/users/${uid}`);
        setUserData(userRes.data.user);

        // MOCK weather (replace with OpenWeatherMap later)
        const mockWeather = {
          condition: "good", // good | bad | cloudy
          temp: 26,
        };
        setWeather(mockWeather);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uid]);

  if (loading || !userData) return <Loading />;

  // Weather message logic
  const weatherMessage =
    weather.condition === "good"
      ? "☀️ Perfect weather! Great day to work from the office."
      : weather.condition === "bad"
      ? "🌧 Weather looks rough. Working from home might be better today."
      : "☁️ Mild weather today. Choose what works best for you.";

  const WeatherIcon =
    weather.condition === "good"
      ? Sun
      : weather.condition === "bad"
      ? CloudRain
      : Cloud;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {greeting}, {userData.name || "there"} !!
          </h1>
          <p className="text-muted-foreground mt-1">Welcome back to WorkNest</p>
        </div>

        <div className="py-2 px-4 rounded-full bg-primary/10 text-primary text-sm font-medium">
          {role === "admin" ? "Administrator" : "Employee"}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Quick Actions & Upcoming */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions
                .filter((action) => action.available)
                .map((action, index) => (
                  <Link
                    key={index}
                    to={action.path}
                    className="group flex flex-col p-5 border border-border rounded-lg hover:border-primary/30 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`p-3 rounded-lg bg-${action.color}/10 text-${action.color}`}
                      >
                        <action.icon className="w-6 h-6" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {action.description}
                    </p>
                  </Link>
                ))}
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Your Upcoming Bookings
              </h2>
              <Link
                to="/dashboard/my-bookings"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center"
              >
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* {userData.upcomingBooking ? (
              <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Desk {userData.upcomingBooking.desk}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {userData.upcomingBooking.floor}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-primary/20 text-primary text-sm font-medium rounded-full">
                    {userData.upcomingBooking.date}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{userData.upcomingBooking.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-1 text-primary hover:text-primary/80">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button className="flex items-center gap-1 text-secondary hover:text-secondary/80">
                      <Edit className="w-4 h-4" />
                      Modify
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="font-medium text-foreground mb-2">
                  No upcoming bookings
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Book a desk or meeting room to get started
                </p>
                <Link
                  to="/dashboard/desk-booking"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Book Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )} */}
          </div>
      {/* Weather Card */}
      {/* <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <WeatherIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">
            Today’s Weather · {weather.temp}°C
          </p>
          <p className="font-medium text-foreground">{weatherMessage}</p>
        </div>
      </div> */}
      <WeatherWidget />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={MapPin} label="Available Desks" value="—" />
        <StatCard icon={Calendar} label="Your Bookings" value="—" />
        <StatCard icon={Users} label="Team in Office" value="—" />
        <StatCard icon={Building2} label="Meeting Rooms" value="—" />
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickAction
            to="/dashboard/desk-booking"
            title="Book a Desk"
            description="Reserve a workspace for your day"
            icon={MapPin}
          />

          <QuickAction
            to="/dashboard/meeting-rooms"
            title="Book a Meeting Room"
            description="Schedule meetings with ease"
            icon={Calendar}
          />

          {role === "admin" && (
            <>
              <QuickAction
                to="/dashboard/workspace"
                title="Manage Workspaces"
                description="Add or edit desks and rooms"
                icon={Building2}
              />

              <QuickAction
                to="/dashboard/all-users"
                title="Manage Users"
                description="Control roles and access"
                icon={Users}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;

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

const QuickAction = ({ to, title, description, icon: Icon }) => (
  <Link
    to={to}
    className="flex items-start gap-4 p-5 border border-border rounded-lg hover:border-primary/40 hover:shadow-sm transition"
  >
    <div className="p-3 bg-primary/10 rounded-lg">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
    <ArrowRight className="w-4 h-4 text-muted-foreground mt-1" />
  </Link>
);

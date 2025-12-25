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
<<<<<<< HEAD
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
=======
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay("morning");
    else if (hour < 18) setTimeOfDay("afternoon");
    else setTimeOfDay("evening");
  
    if (!uid || !user) return;
  
    // Try to fetch user
    axios
      .get(`http://localhost:3000/users/${uid}`)
      .then((res) => {
        console.log("Fetched user data:", res.data);
        setUserData(res.data.users);
        setLoading(false);
      })
      .catch(async (err) => {
        console.log("User fetch error:", err);
        
        // If 404, create the user
        if (err.response?.status === 404) {
          try {
            const createResponse = await axios.post('http://localhost:3000/users', {
              uid: user.uid,
              name: user.displayName || user.email,
              email: user.email,
              photoURL: user.photoURL,
              role: 'employee',
              profileCompleted: false
            });
            
            console.log("User created:", createResponse.data);
            setUserData(createResponse.data.user);
          } catch (createError) {
            console.error("Error creating user:", createError);
          }
        }
        setLoading(false);
      });
  }, [uid, user]);
>>>>>>> f7782b38bedf3693ff050e7f2017583de336f85f

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

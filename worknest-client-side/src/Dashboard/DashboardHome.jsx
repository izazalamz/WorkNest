import { useEffect, useState, useContext } from "react";
import {
  MapPin,
  Calendar,
  Users,
  Building2,
  ArrowRight,
  Clock,
  Eye,
  Edit,
} from "lucide-react";
import axios from "axios";
import { Link } from "react-router";
import { AuthContext } from "../contexts/AuthContext";
import useUserRole from "../hooks/useUserRole";
import Loading from "../components/Loading";
import WeatherWidget from "./Dashboardcomponents/WeatherWidget";

const DashboardHome = () => {
  const { user } = useContext(AuthContext);
  const { role } = useUserRole();

  const [userData, setUserData] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const uid = user?.uid;

  /*  Greeting  */
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  /*  Quick Actions  */
  const quickActions = [
    {
      title: "Book a Desk",
      description: "Reserve a workspace for your day",
      path: "/dashboard/desk-booking",
      icon: MapPin,
      available: true,
    },
    {
      title: "Book a Meeting Room",
      description: "Schedule meetings with ease",
      path: "/dashboard/meeting-rooms",
      icon: Calendar,
      available: true,
    },
    {
      title: "Manage Workspaces",
      description: "Add or edit desks and rooms",
      path: "/dashboard/workspace",
      icon: Building2,
      available: role === "admin",
    },
    {
      title: "Manage Users",
      description: "Control roles and access",
      path: "/dashboard/all-users",
      icon: Users,
      available: role === "admin",
    },
  ];

  /*  Fetch User  */
  useEffect(() => {
    if (!uid) return;

    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/users/${uid}`);
        setUserData(res.data.user);
      } catch (err) {
        console.error("User fetch error:", err);
      }
    };

    fetchUser();
  }, [uid]);

  /*  Fetch Bookings  */
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:3000/api/bookings/my?uid=${user.uid}`
        );

        setUpcomingBookings(res.data.upcomingBookings || []);
      } catch (err) {
        console.error("Booking fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  if (loading || !userData) return <Loading />;

  const booking = upcomingBookings[0]; // show nearest booking only

  return (
    <div className="space-y-8">
      {/*  Header  */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {greeting}, {userData.name || "there"} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Welcome back to WorkNest</p>
        </div>

        <div className="py-2 px-4 rounded-full bg-primary/10 text-primary text-sm font-medium">
          {role === "admin" ? "Administrator" : "Employee"}
        </div>
      </div>

      {/*  Main Grid  */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/*  Left Column  */}
        <div className="lg:col-span-2 space-y-8">
          {/*  Quick Actions  */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions
                .filter((a) => a.available)
                .map((action, index) => (
                  <Link
                    key={index}
                    to={action.path}
                    className="group flex flex-col p-5 border border-border rounded-lg hover:border-primary/30 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary">
                        <action.icon className="w-6 h-6" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>

                    <h3 className="font-semibold text-foreground group-hover:text-primary">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {action.description}
                    </p>
                  </Link>
                ))}
            </div>
          </div>

          {/*  Upcoming Bookings  */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Your Upcoming Bookings
              </h2>
              <Link
                to="/dashboard/my-bookings"
                className="text-sm font-medium text-primary hover:text-primary/80 flex items-center"
              >
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {booking ? (
              <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Workspace Booking
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Status: {booking.status}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-primary/20 text-primary text-sm font-medium rounded-full">
                    {new Date(booking.startAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {new Date(booking.startAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {new Date(booking.endAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
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
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Book Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/*  Right Column  */}
        <div>
          <WeatherWidget />
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;

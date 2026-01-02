import { useState, useEffect, use } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Building2,
  Smartphone,
  BarChart3,
  Download,
  Filter,
  Eye,
  Edit,
  Bell,
} from "lucide-react";
import { Link } from "react-router";
import useUserRole from "../hooks/useUserRole";
import useNotifications from "../hooks/useNotifications";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";
import Loading from "../components/Loading";

const DashboardHome = () => {
  const [userData, setUserData] = useState(null);
  const [timeOfDay, setTimeOfDay] = useState("");
  const [loading, setLoading] = useState(true);
  const { role } = useUserRole();
  const userRole = role;
  const { user } = use(AuthContext);
  const uid = user?.uid;
  //const { notifications, markAsRead, showNotification } = useNotifications();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay("morning");
    else if (hour < 18) setTimeOfDay("afternoon");
    else setTimeOfDay("evening");

    if (!uid) return;

    axios
      .get(`http://localhost:3000/api/users/${uid}`)
      .then((res) => {
        console.log("Fetched user data:", res.data);
        setUserData(res.data.users);
      })
      .catch((err) => console.log("User fetch error:", err));

    // Simulate loading
    setLoading(false);
  }, [uid]);

  const commonStats = [
    {
      label: "Available Desks",
      value: "42",
      change: "+12%",
      color: "text-primary",
      icon: MapPin,
      trend: "up",
    },
    {
      label: "Booked Today",
      value: "18",
      change: "+5%",
      color: "text-secondary",
      icon: Calendar,
      trend: "up",
    },
    {
      label: "Team In Office",
      value: "24",
      change: "+8%",
      color: "text-accent",
      icon: Users,
      trend: "up",
    },
    {
      label: "Meeting Rooms Free",
      value: "6",
      change: "-2%",
      color: "text-primary",
      icon: Building2,
      trend: "down",
    },
  ];

  // Admin-specific stats
  const adminStats = [
    {
      label: "Office Occupancy",
      value: "68%",
      change: "+4%",
      color: "text-primary",
      icon: TrendingUp,
      trend: "up",
    },
    {
      label: "Cost Savings",
      value: "$2,450",
      change: "+15%",
      color: "text-success",
      icon: TrendingUp,
      trend: "up",
    },
    {
      label: "Utilization Rate",
      value: "82%",
      change: "+3%",
      color: "text-secondary",
      icon: BarChart3,
      trend: "up",
    },
    {
      label: "Avg Booking Time",
      value: "3.2s",
      change: "-0.5s",
      color: "text-accent",
      icon: Clock,
      trend: "down",
    },
  ];

  const upcomingMeetings = [
    {
      title: "Team Sync",
      room: "Conference Room A",
      time: "2:00 PM",
      attendees: 8,
      duration: "1h",
    },
    {
      title: "Client Meeting",
      room: "Meeting Room C",
      time: "4:30 PM",
      attendees: 4,
      duration: "1.5h",
    },
    {
      title: "Project Review",
      room: "Board Room",
      time: "11:00 AM",
      attendees: 6,
      duration: "2h",
    },
  ];

  const recentActivity = [
    {
      user: "Sarah Chen",
      action: "booked Desk A-12",
      time: "10 min ago",
      type: "booking",
    },
    {
      user: "Mike Ross",
      action: "canceled Meeting Room B",
      time: "25 min ago",
      type: "cancel",
    },
    {
      user: "Lisa Wong",
      action: "updated profile",
      time: "1 hour ago",
      type: "update",
    },
    {
      user: "David Kim",
      action: "checked into office",
      time: "2 hours ago",
      type: "checkin",
    },
  ];

  const quickActions = [
    {
      title: "Book a Desk",
      description: "Reserve your workspace for today or upcoming days",
      icon: MapPin,
      color: "primary",
      path: "/dashboard/desk-booking",
      available: true,
    },
    {
      title: "Schedule Meeting",
      description: "Book a conference room for your team",
      icon: Calendar,
      color: "secondary",
      path: "/dashboard/meeting-rooms",
      available: true,
    },
    {
      title: "Invite Team Member",
      description: "Add new members to your organization",
      icon: Users,
      color: "primary",
      path: "/dashboard/team",
      available: userRole === "admin",
    },
    {
      title: "View Analytics",
      description: "See workspace utilization reports",
      icon: BarChart3,
      color: "accent",
      path: "/dashboard/analytics",
      available: userRole === "admin",
    },
  ];

  // Office utilization data for charts
  const officeUtilization = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    data: [65, 72, 80, 68, 75],
  };

  const handleQuickAction = (action) => {
    console.log("Quick action:", action);
    // In real app, navigate to the path
  };

  if (loading || !userData) {
    return <Loading />;
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Good {timeOfDay}, {userData?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome to your WorkNest dashboard. Here's your workspace overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
            {userRole === "admin" ? "Administrator" : "Employee"}
          </div>
          <div className="text-sm text-muted-foreground">
            {userData?.companyName}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Workspace Overview
          </h2>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            {userRole === "admin" && (
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(userRole === "admin" ? adminStats : commonStats).map(
            (stat, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-lg ${stat.color.replace(
                      "text-",
                      "bg-"
                    )}/10 group-hover:scale-110 transition-transform`}
                  >
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div
                    className={`text-sm font-medium flex items-center ${
                      stat.trend === "up" ? "text-success" : "text-error"
                    }`}
                  >
                    <TrendingUp
                      className={`w-3 h-3 mr-1 ${
                        stat.trend === "up" ? "" : "rotate-180"
                      }`}
                    />
                    {stat.change}
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground mb-2">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            )
          )}
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
        </div>

        {/* Right Column - Activity & Team */}
        <div className="space-y-8">
          {/* Notifications */}
          {/* <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Notifications
              </h2>
              <Bell className="w-5 h-5 text-muted-foreground" />
            </div>
            {/* <div className="space-y-4">
              {notifications.slice(0, 4).map((notification, index) => (
                <div
                  key={notification._id}
                  className={`flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors ${
                    !notification.isRead ? "bg-primary/5 border-l-4 border-primary" : ""
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      notification.type === "booking"
                        ? "bg-primary/10 text-primary"
                        : notification.type === "reminder"
                        ? "bg-secondary/10 text-secondary"
                        : notification.type === "alert"
                        ? "bg-error/10 text-error"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="text-xs text-primary hover:text-primary/80"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              ))}
            </div> */}
            <button className="w-full mt-6 py-2.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors border border-primary/20 rounded-lg hover:bg-primary/5">
              View All Notifications
            </button>
          </div> */}

          {/* Recent Activity */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                Recent Activity
              </h2>
              <Clock className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {recentActivity.slice(0, 4).map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={`p-2 rounded-full ${
                      activity.type === "booking"
                        ? "bg-primary/10 text-primary"
                        : activity.type === "cancel"
                        ? "bg-error/10 text-error"
                        : activity.type === "checkin"
                        ? "bg-success/10 text-success"
                        : "bg-secondary/10 text-secondary"
                    }`}
                  >
                    {activity.type === "booking" && (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {activity.type === "cancel" && (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {activity.type === "checkin" && (
                      <MapPin className="w-4 h-4" />
                    )}
                    {activity.type === "update" && <Edit className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{activity.user}</span>{" "}
                      {activity.action}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors border border-primary/20 rounded-lg hover:bg-primary/5">
              View All Activity
            </button>
          </div>

          {/* Team Members (Admin) or Office Status (Employee) */}
          {/* {userRole === "admin" ? (
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Team Members
              </h2>
              <div className="space-y-3">
                {userData.teamMembers.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {member.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{member}</p>
                        <p className="text-xs text-muted-foreground">
                          In office today
                        </p>
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                  </div>
                ))}
              </div>
              <Link
                to="/dashboard/team"
                className="w-full mt-6 py-2.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors border border-primary/20 rounded-lg hover:bg-primary/5 flex items-center justify-center"
              >
                Manage Team
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Office Status
              </h2>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Floor 3 Occupancy
                    </span>
                    <span className="text-sm font-medium text-primary">
                      72%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="w-3/4 h-full rounded-full bg-primary"></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Quiet Zones Available
                    </span>
                    <span className="text-sm font-medium text-secondary">
                      4/6
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="w-2/3 h-full rounded-full bg-secondary"></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Collaboration Spaces
                    </span>
                    <span className="text-sm font-medium text-accent">3/5</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="w-3/5 h-full rounded-full bg-accent"></div>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-foreground font-medium mb-1">
                  📍 Your nearest available desk:
                </p>
                <p className="text-sm text-muted-foreground">
                  Desk B-08, 2nd Floor (Quiet Zone)
                </p>
              </div>
            </div>
          )} */}
        </div>
      </div>

      {/* Admin-only Section */}
      {userRole === "admin" && (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              Office Utilization Analytics
            </h2>
            <div className="flex items-center gap-2">
              <select className="px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option>This Week</option>
                <option>Last Week</option>
                <option>This Month</option>
              </select>
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                Generate Report
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Utilization Chart */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">
                Daily Occupancy Rate
              </h3>
              <div className="space-y-3">
                {officeUtilization.labels.map((day, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-16 text-sm text-muted-foreground">
                      {day}
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-muted rounded-full h-3">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${officeUtilization.data[index]}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-12 text-right text-sm font-medium text-foreground">
                      {officeUtilization.data[index]}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">
                Key Insights
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-success/5 border border-success/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-success" />
                    <h4 className="font-medium text-foreground">
                      Peak Utilization
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Wednesday shows highest occupancy (80%). Consider adding
                    more flexible seating.
                  </p>
                </div>
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-primary" />
                    <h4 className="font-medium text-foreground">
                      Cost Optimization
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You could save ~$1,200/month by optimizing underutilized
                    spaces.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;

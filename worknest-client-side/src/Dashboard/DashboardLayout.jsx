import { useState, useEffect, useContext } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";

import {
  Activity,
  Menu,
  X,
  LayoutDashboard,
  Calendar,
  MapPin,
  Users,
  BarChart3,
  Settings,
  User,
  LogOut,
  Building2,
  Search,
  Bell,
  ChevronDown,
  HelpCircle,
  PlusSquare,
  ChartBar,
} from "lucide-react";
import { AuthContext } from "../contexts/AuthContext";
import useUserRole from "../hooks/useUserRole";
import Loading from "../components/Loading";
import axios from "axios";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOutUser, loading } = useContext(AuthContext);
  const { role } = useUserRole();
  const [userData, setUserData] = useState({});
  const [error, setError] = useState("");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      isActive
        ? "bg-primary/10 text-primary border-l-4 border-primary"
        : "hover:bg-muted text-foreground/80"
    }`;

  const handleSignOut = () => {
    signOutUser()
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Fetch user data
  useEffect(() => {
    if (!user?.uid) return;

    axios
      .get(`http://localhost:3000/users/${user.uid}`)
      .then((res) => {
        const u = res.data.user;
        setUserData({
          name: u.name || "",
          companyName: u.companyName || "",
          department: u.department || "",
          role: u.role || "employee",
          photoURL: u.photoURL || "",
        });
      })
      .catch(() => setError("Failed to load profile"));
  }, [user]);

  if (loading || !user) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-muted transition-colors md:hidden"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-6 h-6 text-foreground" />
            </button>

            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">WorkNest</h1>
                <p className="text-xs text-muted-foreground">Dashboard</p>
              </div>
            </div>

            {/* Search - Desktop only */}
            <div className="hidden md:block relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search desks, rooms, team..."
                className="pl-10 pr-4 py-2 w-64 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell className="w-5 h-5 text-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  {userData.photoURL ? (
                    <img
                      src={userData.photoURL}
                      alt={userData.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-foreground">
                    {userData.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {userData.role === "admin" ? "Administrator" : "Employee"}
                  </p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform ${
                    userDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-20 overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <p className="font-medium text-foreground">
                        {userData.name}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {userData.email}
                      </p>
                      <div className="mt-2">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                          {userData.role}
                        </span>
                      </div>
                    </div>
                    <div className="p-2">
                      <NavLink
                        to="/dashboard/profile"
                        className="flex items-center space-x-3 px-3 py-2.5 rounded hover:bg-muted transition-colors"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm">Profile Settings</span>
                      </NavLink>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-3 w-full px-3 py-2.5 rounded hover:bg-muted transition-colors text-error"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Log Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Toggle button for sidebar (Mobile) - Alternative */}
        {!sidebarOpen && (
          <button
            className="md:hidden p-4 absolute top-2 left-2 z-30 text-primary bg-card rounded-lg shadow"
            onClick={toggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <Menu size={24} />
          </button>
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 z-30 bg-card text-foreground w-64 min-h-screen p-6 transform transition-transform duration-300 ease-in-out border-r border-border
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:relative md:translate-x-0 md:flex md:flex-col`}
        >
          {/* Close button inside sidebar (mobile only) */}
          <div className="flex justify-between items-center mb-8 md:hidden">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">WorkNest</h1>
              </div>
            </div>
            <button onClick={toggleSidebar} aria-label="Close Sidebar">
              <X size={24} className="text-foreground" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            <NavLink to="/dashboard" className={linkClasses} end>
              <LayoutDashboard size={20} />
              <span className="font-medium">Dashboard</span>
            </NavLink>
<<<<<<< HEAD

            <NavLink to="/dashboard/nestboard" className={linkClasses} end>
              <LayoutDashboard size={20} />
              <span className="font-medium">NestBoard</span>
            </NavLink>

            <NavLink to="/dashboard/desk-booking" className={linkClasses}>
              <MapPin size={20} />
              <span className="font-medium">Desk Booking</span>
            </NavLink>
            <NavLink to="/dashboard/meeting-rooms" className={linkClasses}>
              <Calendar size={20} />
              <span className="font-medium">Meeting Rooms</span>
            </NavLink>
            <NavLink to="/dashboard/my-bookings" className={linkClasses}>
              <Users size={20} />
              <span className="font-medium">My Bookings</span>
            </NavLink>
=======
            
>>>>>>> f7782b38bedf3693ff050e7f2017583de336f85f
            {role === "employee" && (
              <>
                <NavLink to="/dashboard/desk-booking" className={linkClasses}>
                  <MapPin size={20} />
                  <span className="font-medium">Desk Booking</span>
                </NavLink>
                <NavLink to="/dashboard/meeting-rooms" className={linkClasses}>
                  <Calendar size={20} />
                  <span className="font-medium">Meeting Rooms</span>
                </NavLink>
                <NavLink to="/dashboard/my-bookings" className={linkClasses}>
                  <Users size={20} />
                  <span className="font-medium">My Bookings</span>
                </NavLink>
              </>
            )}

            {role === "admin" && (
              <>
                <NavLink to="/dashboard/allusers" className={linkClasses}>
                  <Users size={20} />
                  <span className="font-medium">All Users</span>
                </NavLink>
                <NavLink to="/dashboard/add-workspace" className={linkClasses}>
                  <PlusSquare size={20} />
                  <span className="font-medium">Add Workspace</span>
                </NavLink>
                <NavLink
                  to="/dashboard/manage-workspace"
                  className={linkClasses}
                >
                  <Settings size={20} />
                  <span className="font-medium">Manage Workspace</span>
                </NavLink>
                <NavLink to="/dashboard/analytics" className={linkClasses}>
                  <BarChart3 size={20} />
                  <span className="font-medium">Analytics</span>
                </NavLink>
                <NavLink to="/dashboard/admin/support" className={linkClasses}>
                  <ChartBar size={20} />
                  <span className="font-medium">Support</span>
                </NavLink>
              </>
            )}

            <NavLink to="/dashboard/profile" className={linkClasses}>
              <User size={20} />
              <span className="font-medium">My Profile</span>
            </NavLink>
<<<<<<< HEAD

=======
            
>>>>>>> f7782b38bedf3693ff050e7f2017583de336f85f
            <NavLink to="/dashboard/activity" className={linkClasses}>
              <Activity size={20} />
              <span className="font-medium">My Activity</span>
            </NavLink>

            <NavLink to="/dashboard/active" className={linkClasses}>
              <Users size={20} />
              <span className="font-medium">Active Status</span>
            </NavLink>
          </nav>

          {/* Help Section */}
          {role === "employee" && (
            <div className="mt-8 p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/10">
              <div className="flex items-start space-x-3 mb-3">
                <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Need help?
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Our support team is here 24/7
                  </p>
                </div>
              </div>
              <NavLink
                to={"/dashboard/support"}
                className="flex items-center justify-center w-full py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Contact Support
              </NavLink>
            </div>
          )}
          {/* Logout Button */}
          <div className="mt-8 pt-6 border-t border-border">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 text-foreground hover:text-error transition-colors w-full px-3 py-2 rounded-lg hover:bg-muted"
            >
              <LogOut size={18} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* Backdrop (Mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 overflow-x-hidden">
          <div className="max-w-full">
            {/* Page Content */}
            <div className="bg-card border border-border rounded-xl p-6">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
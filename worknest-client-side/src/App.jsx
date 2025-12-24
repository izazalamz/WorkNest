import { RouterProvider, createBrowserRouter } from "react-router";
import Root from "./pages/Root";
import Home from "./pages/Home";
import Error from "./pages/Error";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";

import DashboardLayout from "./Dashboard/DashboardLayout";
import DashboardHome from "./Dashboard/DashboardHome";
import AddWorkspace from "./Dashboard/Dashboardcomponents/AddWorkspace";
import DeskBooking from "./Dashboard/Dashboardcomponents/DeskBooking";
import MeetingRooms from "./Dashboard/Dashboardcomponents/MeetingRooms";
import Profile from "./Dashboard/Dashboardcomponents/Profile";
import MyBookings from "./Dashboard/Dashboardcomponents/MyBookings";
import Analytics from "./Dashboard/Dashboardcomponents/Analytics";
import MyActivity from "./Dashboard/Dashboardcomponents/MyActivity";
import ShowActive from "./Dashboard/Dashboardcomponents/ShowActive";

import AuthProvider from "./contexts/AuthProvider";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    errorElement: <Error />,
    children: [
      { path: "/", Component: Home },
      { path: "/login", Component: Login },
      { path: "/signup", Component: SignUp },
    ],
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,
    children: [
      { path: "/dashboard", Component: DashboardHome },
      { path: "/dashboard/add-workspace", Component: AddWorkspace },
      { path: "/dashboard/desk-booking", Component: DeskBooking },
      { path: "/dashboard/meeting-rooms", Component: MeetingRooms },
      { path: "/dashboard/my-bookings", Component: MyBookings },
      { path: "/dashboard/analytics", Component: Analytics },
      { path: "/dashboard/profile", Component: Profile },
      { path: "/dashboard/activity", Component: MyActivity },
      { path: "/dashboard/active", Component: ShowActive }, // NEW ROUTE
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <RouterProvider router={router} />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
import { RouterProvider } from "react-router";
import { createBrowserRouter } from "react-router";
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
import AuthProvider from "./contexts/AuthProvider";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    errorElement: <Error />,

    children: [
      {
        path: "/",
        Component: Home,
      },
      {
        path: "/login",
        Component: Login,
      },
      {
        path: "/signup",
        Component: SignUp,
      },
    ],
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,
    children: [
      {
        path: "/dashboard",
        Component: DashboardHome,
      },

      {
        path: "/dashboard/add-workspace",
        Component: AddWorkspace,
      },
      {
        path: "/dashboard/desk-booking",
        Component: DeskBooking,
      },
      {
        path: "/dashboard/meeting-rooms",
        Component: MeetingRooms,
      },
      {
        path: "/dashboard/my-bookings",
        Component: MyBookings,
      },
      {
        path: "/dashboard/analytics",
        Component: Analytics,
      },
      {
        path: "/dashboard/profile",
        Component: Profile,
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <RouterProvider router={router} />
        <ToastContainer />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;

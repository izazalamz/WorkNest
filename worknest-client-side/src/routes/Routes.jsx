import { createBrowserRouter, RouterProvider } from "react-router";
import Root from "../pages/Root";
import Home from "../pages/Home";
import Error from "../pages/Error";
import SignUp from "../pages/SignUp";
import Login from "../pages/Login";
import DashboardLayout from "../Dashboard/DashboardLayout";
import DashboardHome from "../Dashboard/DashboardHome";
import AddWorkspace from "../Dashboard/Dashboardcomponents/AddWorkspace";
import DeskBooking from "../Dashboard/Dashboardcomponents/DeskBooking";
import MeetingRooms from "../Dashboard/Dashboardcomponents/MeetingRooms";
import Profile from "../Dashboard/Dashboardcomponents/Profile";
import MyBookings from "../Dashboard/Dashboardcomponents/MyBookings";
import Analytics from "../Dashboard/Dashboardcomponents/Analytics";
import RequireProfileCompleted from "../components/RequireProfileCompleted";
import CompleteProfile from "../components/CompleteProfile";
import About from "../pages/About";
import AllUsers from "../Dashboard/Dashboardcomponents/AllUsers";
import ManageWorkspace from "../Dashboard/Dashboardcomponents/ManageWorkspace";
import MyActivity from "../Dashboard/Dashboardcomponents/MyActivity";
import ShowActive from "../Dashboard/Dashboardcomponents/Showactive";
<<<<<<< HEAD
import NestBoard from "../Dashboard/Dashboardcomponents/NestBoard";
import EmployeeSupportChat from "../Dashboard/Dashboardcomponents/EmployeeSupportChat";
import AdminChatRoom from "../Dashboard/Dashboardcomponents/AdminChatRoom";
=======
>>>>>>> f7782b38bedf3693ff050e7f2017583de336f85f

export const router = createBrowserRouter([
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
        path: "/about",
        Component: About,
      },
      {
        path: "/login",
        Component: Login,
      },
      {
        path: "/signup",
        Component: SignUp,
      },
      {
        path: "/complete-profile",
        Component: CompleteProfile,
      },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <RequireProfileCompleted>
        <DashboardLayout />
      </RequireProfileCompleted>
    ),
    children: [
      {
        index: true,
        Component: DashboardHome,
      },
      {
        path: "/dashboard/nestboard",
        Component: NestBoard,
      },

      {
        path: "/dashboard/add-workspace",
        Component: AddWorkspace,
      },
      {
        path: "/dashboard/manage-workspace",
        Component: ManageWorkspace,
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
        path: "/dashboard/support",
        Component: EmployeeSupportChat,
      },
      {
        path: "/dashboard/admin/support",
        Component: AdminChatRoom,
      },
      {
        path: "/dashboard/allusers",
        Component: AllUsers,
      },
      {
        path: "/dashboard/analytics",
        Component: Analytics,
      },
      {
        path: "/dashboard/profile",
        Component: Profile,
      },
      {
        path: "/dashboard/activity",
        Component: MyActivity,
      },
      {
        path: "/dashboard/active",
        Component: ShowActive,
      },
    ],
  },
]);
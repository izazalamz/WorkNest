import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { router } from "./routes/Routes.jsx";
import AuthProvider from "./contexts/AuthProvider.jsx";
import { NotificationProvider } from "./contexts/NotificationContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <RouterProvider router={router} />
        <ToastContainer position="top-right" />
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>
);

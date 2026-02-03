import Layout from "../layouts/Layout";
import Login from "../Pages/Login";
import Dashboard from "../Pages/Dashboard";
import NotFound from "../Pages/NotFound";
import { createBrowserRouter, Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { useAuthStore } from "../stores/auth";

// Protected Route Component
const ProtectedRoute = ({ element }: { element: ReactElement }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      { path: "", element: <Navigate to="/dashboard" replace /> },
      {
        path: "dashboard",
        element: <ProtectedRoute element={<Dashboard />} />,
      },
    ],
  },
]);

export default router;

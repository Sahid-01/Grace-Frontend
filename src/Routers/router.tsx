import Layout from "@/layouts/Layout";
import Login from "@/Pages/Login";
import Dashboard from "@/Pages/Dashboard";
import Users from "@/Pages/Users";
import Class from "@/Pages/Classes";
import MyProfile from "@/Pages/MyProfile";
import { createBrowserRouter, Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { useAuthStore } from "@/stores/Auth/auth";

// Protected Route Component
const ProtectedRoute = ({ element }: { element: ReactElement }) => {
  const { isAuthenticated, token } = useAuthStore();

  // If token exists in localStorage but isAuthenticated is false,
  // it means the store is still initializing
  if (token && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

// Create router instance
const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "", element: <Navigate to="/dashboard" replace /> },
      {
        path: "dashboard",
        element: <ProtectedRoute element={<Dashboard />} />,
      },
      {
        path: "users",
        element: <ProtectedRoute element={<Users />} />,
      },
      {
        path: "classes",
        element: <ProtectedRoute element={<Class />} />,
      },
      {
        path: "profile",
        element: <ProtectedRoute element={<MyProfile />} />,
      },
    ],
  },
]);

// Named export for consistency
export { router };
export default router;

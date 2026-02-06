import Layout from "@/layouts/Layout";
import Login from "@/Pages/Login";
import Dashboard from "@/Pages/Dashboard";
import Users from "@/Pages/Users";
import Class from "@/Pages/Classes";
import Tests from "@/Pages/Tests";
import TestAssignments from "@/Pages/TestAssignments";
import TestMarking from "@/Pages/TestMarking";
import TestSections from "@/Pages/TestSections";
import Questions from "@/Pages/Questions";
import QuestionOptions from "@/Pages/QuestionOptions";
import { createBrowserRouter, Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { useAuthStore } from "@/stores/Auth/auth";

// Protected Route Component
const ProtectedRoute = ({ element }: { element: ReactElement }) => {
  const { isAuthenticated } = useAuthStore();

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
        path: "tests",
        element: <ProtectedRoute element={<Tests />} />,
      },
      {
        path: "test-assignments",
        element: <ProtectedRoute element={<TestAssignments />} />,
      },
      {
        path: "test-marking",
        element: <ProtectedRoute element={<TestMarking />} />,
      },
      {
        path: "test-sections",
        element: <ProtectedRoute element={<TestSections />} />,
      },
      {
        path: "questions",
        element: <ProtectedRoute element={<Questions />} />,
      },
      {
        path: "question-options",
        element: <ProtectedRoute element={<QuestionOptions />} />,
      },
    ],
  },
]);

// Named export for consistency
export { router };
export default router;

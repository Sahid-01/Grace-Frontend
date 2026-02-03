import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../Utils/api";
import { useAuthStore } from "../stores/auth";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuthStore();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!user) {
          const userData = await getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        setError("Failed to load user data");
        console.error("Error fetching user:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [user, setUser]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome, {user?.full_name || user?.name || user?.username || "User"}!
        </h1>
        <p className="text-gray-600 mb-8">
          You have successfully logged in to your dashboard.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-lg border border-emerald-200">
            <h3 className="text-lg font-semibold text-emerald-900 mb-2">
              Username
            </h3>
            <p className="text-emerald-700">@{user?.username}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Full Name
            </h3>
            <p className="text-blue-700 font-medium">
              {user?.full_name || user?.name || "Not provided"}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-900 mb-2">Role</h3>
            <p className="text-purple-700 font-medium capitalize">
              {user?.role || "User"}
            </p>
          </div>
        </div>

        {/* Additional User Info Section */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            User Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">User ID:</span>
              <span className="font-medium text-gray-800">{user?.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Username:</span>
              <span className="font-medium text-gray-800">
                @{user?.username}
              </span>
            </div>
            {user?.full_name && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Full Name:</span>
                <span className="font-medium text-gray-800">
                  {user.full_name}
                </span>
              </div>
            )}
            {user?.role && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Role:</span>
                <span className="font-medium text-gray-800 capitalize">
                  {user.role}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Account Status:</span>
              <span className="font-medium text-emerald-600">Active</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-8 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;

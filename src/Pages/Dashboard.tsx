import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth";

const Dashboard = () => {
  const { user, isAuthenticated, loading, error, logout, self, clearError } =
    useAuthStore();

  // Fetch user data from self API
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated) {
        // Redirect will be handled by Layout component
        return;
      }

      // Only fetch if we don't have user data yet
      if (!user) {
        try {
          clearError();
          await self();
        } catch (err: any) {
          console.error("Error fetching user data:", err);
          if (err.response?.status === 401) {
            // Token expired or invalid - logout will be handled by navbar
            await logout();
          }
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated, user]); // Removed navigate, self, logout, clearError from dependencies

  // Debug log to see user state
  useEffect(() => {}, [user, isAuthenticated, loading, error]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No user data available</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-6 sm:p-8 text-white">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
          Welcome back,{" "}
          {user?.first_name && user?.last_name
            ? `${user.first_name} ${user.last_name}`
            : user?.full_name || user?.name || user?.username || "User"}
          ! 👋
        </h1>
        <p className="text-emerald-100">
          You have successfully logged in to your dashboard.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 sm:p-6 rounded-lg border border-emerald-200">
            <h3 className="text-base sm:text-lg font-semibold text-emerald-900 mb-2">
              Username
            </h3>
            <p className="text-emerald-700 text-sm sm:text-base">
              @{user?.username}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-lg border border-blue-200">
            <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2">
              Full Name
            </h3>
            <p className="text-blue-700 font-medium text-sm sm:text-base">
              {user?.first_name && user?.last_name
                ? `${user.first_name} ${user.last_name}`
                : user?.full_name || user?.name || "Not provided"}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-6 rounded-lg border border-purple-200 sm:col-span-2 lg:col-span-1">
            <h3 className="text-base sm:text-lg font-semibold text-purple-900 mb-2">
              Email
            </h3>
            <p className="text-purple-700 font-medium text-sm sm:text-base break-all">
              {user?.email || "Not provided"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 sm:p-6 rounded-lg border border-orange-200">
            <h3 className="text-base sm:text-lg font-semibold text-orange-900 mb-2">
              Role
            </h3>
            <p className="text-orange-700 font-medium capitalize text-sm sm:text-base">
              {user?.role || "User"}
            </p>
          </div>
        </div>

        {/* Additional User Info Section */}
        <div className="mt-6 sm:mt-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 sm:p-6 border border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
            User Information
          </h2>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
              <span className="text-gray-600 text-sm sm:text-base">Email:</span>
              <span className="font-medium text-gray-800 text-sm sm:text-base break-all">
                {user?.email || "Not provided"}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
              <span className="text-gray-600 text-sm sm:text-base">
                Username:
              </span>
              <span className="font-medium text-gray-800 text-sm sm:text-base">
                @{user?.username}
              </span>
            </div>
            {(user?.first_name || user?.last_name) && (
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="text-gray-600 text-sm sm:text-base">
                  Full Name:
                </span>
                <span className="font-medium text-gray-800 text-sm sm:text-base">
                  {user?.first_name && user?.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user?.first_name || user?.last_name}
                </span>
              </div>
            )}
            {user?.role && (
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="text-gray-600 text-sm sm:text-base">
                  Role:
                </span>
                <span className="font-medium text-gray-800 capitalize text-sm sm:text-base">
                  {user.role}
                </span>
              </div>
            )}
            {user?.student_id && (
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="text-gray-600 text-sm sm:text-base">
                  Student ID:
                </span>
                <span className="font-medium text-gray-800 text-sm sm:text-base">
                  {user.student_id}
                </span>
              </div>
            )}
            {user?.employee_id && (
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
                <span className="text-gray-600 text-sm sm:text-base">
                  Employee ID:
                </span>
                <span className="font-medium text-gray-800 text-sm sm:text-base">
                  {user.employee_id}
                </span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
              <span className="text-gray-600 text-sm sm:text-base">
                Account Status:
              </span>
              <span className="font-medium text-emerald-600 text-sm sm:text-base">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

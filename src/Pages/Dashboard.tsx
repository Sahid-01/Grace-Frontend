import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/Auth/auth";
import { useUsersStore } from "@/stores/Auth/Users";
import { useCoursesStore } from "@/stores/Classes/Course";
import { useSectionsStore } from "@/stores/Classes/Sections";
import { useLessonsStore } from "@/stores/Classes/Lessions";
import { Users, BookOpen, GraduationCap, Award } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const hasFetched = useRef(false);
  const { user, isAuthenticated, loading, error, logout, self, clearError } =
    useAuthStore();
  const { users, fetchUsers } = useUsersStore();
  const { courses, fetchCourses } = useCoursesStore();
  const { sections, fetchSections } = useSectionsStore();
  const { fetchLessons } = useLessonsStore();

  // Fetch user data from self API
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated) {
        return;
      }

      if (!user) {
        try {
          clearError();
          await self();
        } catch (err: any) {
          console.error("Error fetching user data:", err);
          if (err.response?.status === 401) {
            await logout();
          }
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated, user]);

  // Fetch stats data - only once
  useEffect(() => {
    if (!hasFetched.current && user) {
      if (user.role !== "student") {
        fetchUsers();
      }
      fetchCourses();
      fetchSections();
      fetchLessons();
      hasFetched.current = true;
    }
  }, [user]);

  // Calculate stats
  const totalStudents =
    users?.filter((u) => u.role?.toLowerCase() === "student").length || 0;
  const totalTeachers =
    users?.filter((u) => u.role?.toLowerCase() === "teacher").length || 0;
  const totalCourses = courses?.length || 0;
  const totalSections = sections?.length || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-[#1a365d] border-r-[#2c5282] animate-spin"></div>
          </div>
          <p className="text-gray-800 font-semibold text-lg">
            Loading Dashboard...
          </p>
          <p className="text-gray-500 text-sm mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-200">
            <span className="text-4xl">⚠️</span>
          </div>
          <div className="mb-6 p-6 bg-white border border-red-200 rounded-lg shadow-sm">
            <p className="text-red-700 font-semibold text-lg">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#c41e3a] text-white rounded-lg hover:bg-[#a01629] transition-colors shadow-sm font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-gray-300">
            <span className="text-4xl">👤</span>
          </div>
          <p className="text-gray-600 mb-6 text-lg font-medium">
            No user data available
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-colors shadow-sm font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#1a365d] to-[#2c5282] rounded-lg shadow-md p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back,{" "}
              {user?.first_name && user?.last_name
                ? `${user.first_name} ${user.last_name}`
                : user?.full_name || user?.name || user?.username || "User"}
            </h1>
            <p className="text-blue-100 text-lg">
              {user?.role === "student"
                ? "Student Dashboard"
                : user?.role === "teacher"
                  ? "Teacher Dashboard"
                  : "Administrator Dashboard"}
            </p>
          </div>
          <div className="hidden md:block"></div>
        </div>
      </div>

      {/* Stats Cards - Only show for non-students */}
      {user?.role !== "student" && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Overview Statistics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Students */}
            <button
              onClick={() => navigate("/users")}
              className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-left group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#1a365d]/10 rounded-lg flex items-center justify-center group-hover:bg-[#1a365d]/20 transition-colors">
                  <Users className="w-6 h-6 text-[#1a365d]" />
                </div>
                <Award className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Total Students
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {totalStudents}
              </p>
              <p className="text-xs text-[#1a365d] mt-3 font-medium">
                View all students →
              </p>
            </button>

            {/* Total Teachers */}
            <button
              onClick={() => navigate("/users")}
              className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-left group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#2c5282]/10 rounded-lg flex items-center justify-center group-hover:bg-[#2c5282]/20 transition-colors">
                  <Users className="w-6 h-6 text-[#2c5282]" />
                </div>
                <Award className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Total Teachers
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {totalTeachers}
              </p>
              <p className="text-xs text-[#2c5282] mt-3 font-medium">
                View all teachers →
              </p>
            </button>

            {/* Total Courses */}
            <button
              onClick={() => navigate("/classes")}
              className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-left group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#c41e3a]/10 rounded-lg flex items-center justify-center group-hover:bg-[#c41e3a]/20 transition-colors">
                  <BookOpen className="w-6 h-6 text-[#c41e3a]" />
                </div>
                <Award className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Total Courses
              </h3>
              <p className="text-3xl font-bold text-gray-900">{totalCourses}</p>
              <p className="text-xs text-[#c41e3a] mt-3 font-medium">
                View all courses →
              </p>
            </button>

            {/* Total Sections */}
            <button
              onClick={() => navigate("/classes")}
              className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-left group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#1a365d]/10 rounded-lg flex items-center justify-center group-hover:bg-[#1a365d]/20 transition-colors">
                  <GraduationCap className="w-6 h-6 text-[#1a365d]" />
                </div>
                <Award className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                Total Sections
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {totalSections}
              </p>
              <p className="text-xs text-[#1a365d] mt-3 font-medium">
                View details →
              </p>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => navigate("/users")}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="w-5 h-5 text-[#1a365d] mr-3" />
                <span className="font-medium text-gray-700">Manage Users</span>
              </button>
              <button
                onClick={() => navigate("/classes")}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BookOpen className="w-5 h-5 text-[#2c5282] mr-3" />
                <span className="font-medium text-gray-700">
                  Manage Courses
                </span>
              </button>
              <button
                onClick={() => navigate("/classes")}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <GraduationCap className="w-5 h-5 text-[#c41e3a] mr-3" />
                <span className="font-medium text-gray-700">View Reports</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student View */}
      {user?.role === "student" && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Your Learning Journey
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Your Courses
              </h3>
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <BookOpen className="w-12 h-12 text-[#1a365d] mx-auto mb-3" />
                  <p className="text-gray-600">Start exploring your courses</p>
                  <button
                    onClick={() => navigate("/classes")}
                    className="mt-4 px-6 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-colors"
                  >
                    View Courses
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Recent Activity
              </h3>
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Award className="w-12 h-12 text-[#c41e3a] mx-auto mb-3" />
                  <p className="text-gray-600">No recent activity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

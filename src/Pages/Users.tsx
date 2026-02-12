import { useEffect, useState, useRef } from "react";
import { useUsersStore } from "@/stores/Auth/Users";
import { useAuthStore } from "@/stores/Auth/auth";
import { useBranchStore } from "@/stores/Branch";
import { useCoursesStore } from "@/stores/Classes/Course";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/Components/Toast";
import {
  Users as UsersIcon,
  Plus,
  Trash2,
  X,
  CheckCircle,
  XCircle,
  Edit,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Building2,
  BookOpen,
} from "lucide-react";

const Users = () => {
  const { toasts, addToast, removeToast } = useToast();
  const {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    deleteUser,
    activateUser,
    deactivateUser,
    createUser,
    updateUser,
    clearError,
  } = useUsersStore();
  const { user: currentUser, self } = useAuthStore();
  const { branches, fetchBranches } = useBranchStore();
  const { courses, fetchCourses } = useCoursesStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const hasFetched = useRef(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: "",
    role: "student",
    branch: undefined as number | undefined,
    enrolled_courses: [] as number[],
    student_id: "",
    employee_id: "",
  });

  const isSuperadmin = currentUser?.role === "superadmin";
  const isAdmin = currentUser?.role === "admin";
  const isTeacher = currentUser?.role === "teacher";

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [employeeIdFilter, setEmployeeIdFilter] = useState("");
  const [studentIdFilter, setStudentIdFilter] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Temporary filter states (for input fields)
  const [tempSearchQuery, setTempSearchQuery] = useState("");
  const [tempEmployeeId, setTempEmployeeId] = useState("");
  const [tempStudentId, setTempStudentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  useEffect(() => {
    if (!hasFetched.current) {
      self(); // Fetch current user data
      fetchUsers(currentPage, perPage);
      fetchBranches();
      fetchCourses();
      hasFetched.current = true;
    }
  }, []);

  // Fetch when pagination or role filter changes
  useEffect(() => {
    if (!hasFetched.current) return;

    const filters = {
      search: searchQuery,
      role: roleFilter,
      student_id: studentIdFilter,
      employee_id: employeeIdFilter,
    };
    fetchUsers(currentPage, perPage, filters);
  }, [currentPage, perPage, roleFilter]);

  // Apply filters manually
  const applyFilters = () => {
    setSearchQuery(tempSearchQuery);
    setEmployeeIdFilter(tempEmployeeId);
    setStudentIdFilter(tempStudentId);
    setCurrentPage(1); // Reset to first page

    const filters = {
      search: tempSearchQuery,
      role: roleFilter,
      student_id: tempStudentId,
      employee_id: tempEmployeeId,
    };
    fetchUsers(1, perPage, filters);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple submissions with debounce (2 seconds)
    const now = Date.now();
    if (isSubmitting || loading || (now - lastSubmitTime < 2000)) {
      console.log("Submission blocked - already processing");
      return;
    }

    setLastSubmitTime(now);

    if (!currentUser?.role) {
      addToast("error", "Unable to determine your role");
      return;
    }

    // Password validation
    if (formData.password && formData.password !== formData.password_confirm) {
      addToast("error", "Passwords don't match");
      return;
    }

    setIsSubmitting(true);

    const userData: any = {
      username: formData.username,
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      role: formData.role,
    };

    // Include password if provided (both create and edit mode)
    if (formData.password) {
      userData.password = formData.password;
      userData.password_confirm = formData.password_confirm;
    }

    if (formData.student_id) userData.student_id = formData.student_id;
    if (formData.employee_id) userData.employee_id = formData.employee_id;

    // Branch assignment
    if (isSuperadmin && formData.branch) {
      // Superadmin explicitly selects branch
      userData.branch = formData.branch;
    } else if ((isAdmin || isTeacher) && currentUser?.branch_id) {
      // Admin and Teacher auto-assign their branch
      userData.branch = currentUser.branch_id;
    }

    // Enrolled courses (only for students)
    if (formData.role === "student" && formData.enrolled_courses.length > 0) {
      userData.enrolled_courses = formData.enrolled_courses;
    }

    // Clear previous errors
    clearError();

    try {
      if (isEditMode && editingUserId) {
        await updateUser(editingUserId, userData);
      } else {
        await createUser(userData, currentUser.role);
      }

      // Check error state after operation completes
      setTimeout(() => {
        const currentError = useUsersStore.getState().error;

        if (!currentError) {
          addToast(
            "success",
            isEditMode
              ? "User updated successfully!"
              : "User created successfully!",
          );
          setIsModalOpen(false);
          setIsEditMode(false);
          setEditingUserId(null);
          setFormData({
            username: "",
            email: "",
            password: "",
            password_confirm: "",
            first_name: "",
            last_name: "",
            role: "student",
            branch: undefined,
            enrolled_courses: [],
            student_id: "",
            employee_id: "",
          });
          // Refresh current page
          const filters = {
            search: searchQuery,
            role: roleFilter,
            student_id: studentIdFilter,
            employee_id: employeeIdFilter,
          };
          fetchUsers(currentPage, perPage, filters);
        } else {
          // Show error as toast notification
          addToast("error", currentError);
        }
        
        setIsSubmitting(false);
      }, 100);
    } catch (error) {
      // Handle any unexpected errors
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: any) => {
    setIsEditMode(true);
    setEditingUserId(user.id);
    setIsSubmitting(false);
    setLastSubmitTime(0);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      password_confirm: "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      role: user.role,
      branch: user.branch || undefined,
      enrolled_courses: user.enrolled_courses || [],
      student_id: user.student_id || "",
      employee_id: user.employee_id || "",
    });
    clearError();
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setIsEditMode(false);
    setEditingUserId(null);
    setIsSubmitting(false);
    setLastSubmitTime(0);
    setFormData({
      username: "",
      email: "",
      password: "",
      password_confirm: "",
      first_name: "",
      last_name: "",
      role: "student",
      branch: undefined,
      enrolled_courses: [],
      student_id: "",
      employee_id: "",
    });
    clearError();
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteUser(id);

      setTimeout(() => {
        const currentError = useUsersStore.getState().error;

        if (!currentError) {
          addToast("warning", "User deleted successfully!");
        } else {
          addToast("error", currentError);
        }

        // Refresh current page
        const filters = {
          search: searchQuery,
          role: roleFilter,
          student_id: studentIdFilter,
          employee_id: employeeIdFilter,
        };
        fetchUsers(currentPage, perPage, filters);
      }, 100);
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    if (isActive) {
      await deactivateUser(id);
    } else {
      await activateUser(id);
    }

    setTimeout(() => {
      const currentError = useUsersStore.getState().error;

      if (!currentError) {
        if (isActive) {
          addToast("warning", "User deactivated successfully!");
        } else {
          addToast("success", "User activated successfully!");
        }
      } else {
        addToast("error", currentError);
      }

      // Refresh current page
      const filters = {
        search: searchQuery,
        role: roleFilter,
        student_id: studentIdFilter,
        employee_id: employeeIdFilter,
      };
      fetchUsers(currentPage, perPage, filters);
    }, 100);
  };

  const getAvailableRoles = () => {
    const role = currentUser?.role?.toLowerCase();

    if (role === "superadmin") {
      return ["admin", "teacher", "student"];
    } else if (role === "admin") {
      return ["teacher", "student"];
    } else if (role === "teacher") {
      return ["student"];
    }

    return ["student"];
  };

  // Filter users based on search and filters
  const filteredUsers = Array.isArray(users)
    ? users.filter((user) => user.role?.toLowerCase() !== "superadmin")
    : [];

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setRoleFilter("all");
    setEmployeeIdFilter("");
    setStudentIdFilter("");
    setTempSearchQuery("");
    setTempEmployeeId("");
    setTempStudentId("");
    setCurrentPage(1);

    const filters = {
      search: "",
      role: "all",
      student_id: "",
      employee_id: "",
    };
    fetchUsers(1, perPage, filters);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1); // Reset to first page
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    if (!pagination) return [];

    const { current_page, last_page } = pagination;
    const pages: (number | string)[] = [];

    if (last_page <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= last_page; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (current_page > 3) {
        pages.push("...");
      }

      // Show pages around current page
      for (
        let i = Math.max(2, current_page - 1);
        i <= Math.min(last_page - 1, current_page + 1);
        i++
      ) {
        pages.push(i);
      }

      if (current_page < last_page - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(last_page);
    }

    return pages;
  };

  if (loading && (!users || users.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-[#1a365d] border-r-[#2c5282] animate-spin"></div>
          </div>
          <p className="text-gray-700 font-semibold text-lg">
            Loading users...
          </p>
          <p className="text-gray-500 text-sm mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a365d] to-[#2c5282] rounded-lg shadow-md p-6 mb-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                User Management
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-blue-100">Manage all users in the system</p>
                {(isAdmin || currentUser?.role === "teacher") &&
                  currentUser?.branch && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/20 rounded-full text-xs font-semibold">
                      <Building2 className="w-3 h-3" />
                      {currentUser.branch}
                    </span>
                  )}
              </div>
            </div>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-white text-[#1a365d] px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-all font-semibold shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add New User
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl">⚠️</span>
            </div>
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {/* Filters Section - Inside Table */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#1a365d]" />
              <h3 className="text-sm font-semibold text-gray-800">Filters</h3>
            </div>
            {(searchQuery ||
              roleFilter !== "all" ||
              employeeIdFilter ||
              studentIdFilter) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-all"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={tempSearchQuery}
                onChange={(e) => setTempSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
              />
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d] capitalize"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </div>

            {/* Employee ID Filter */}
            <div>
              <input
                type="text"
                placeholder="Employee ID"
                value={tempEmployeeId}
                onChange={(e) => setTempEmployeeId(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
              />
            </div>

            {/* Student ID Filter */}
            <div>
              <input
                type="text"
                placeholder="Student ID"
                value={tempStudentId}
                onChange={(e) => setTempStudentId(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
              />
            </div>

            {/* Search Button */}
            <div>
              <button
                onClick={applyFilters}
                className="w-full px-3 py-2 text-sm bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-all font-medium flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </div>

          {/* Results Count */}
          {pagination && (
            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
              <p className="text-xs text-gray-600">
                Showing{" "}
                <span className="font-semibold text-[#1a365d]">
                  {filteredUsers.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#1a365d]">
                  {pagination.total}
                </span>{" "}
                users
              </p>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600">Per page:</label>
                <select
                  value={perPage}
                  onChange={(e) => handlePerPageChange(Number(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-gradient-to-br from-[#1a365d] to-[#2c5282] rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                        {user.first_name?.charAt(0).toUpperCase() ||
                          user.username?.charAt(0).toUpperCase() ||
                          "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {user.first_name && user.last_name
                            ? `${user.first_name} ${user.last_name}`
                            : user.full_name || user.username || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-500">
                          @{user.username || "unknown"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {user.email || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#1a365d] capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.branch_name ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700">
                        <Building2 className="w-3 h-3" />
                        {user.branch_name}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {user.role?.toLowerCase() === "student"
                      ? user.student_id || "-"
                      : user.employee_id || "-"}
                  </td>
                  <td className="px-6 py-4">
                    {user.is_active ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                        <XCircle className="w-3.5 h-3.5" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {currentUser?.id !== user.id && (
                        <>
                          <button
                            onClick={() =>
                              handleToggleActive(
                                user.id,
                                user.is_active || false,
                              )
                            }
                            className={`p-2 rounded-lg transition-all ${
                              user.is_active
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-green-50 text-green-600 hover:bg-green-100"
                            }`}
                            title={user.is_active ? "Deactivate" : "Activate"}
                          >
                            {user.is_active ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {currentUser?.id === user.id && (
                        <span className="text-xs text-[#1a365d] italic px-2 font-semibold">
                          You
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && users.length > 0 && !loading && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-600 text-xl font-semibold mb-2">
              No users match your filters
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-all shadow-sm font-semibold"
            >
              <X className="w-5 h-5" />
              Clear All Filters
            </button>
          </div>
        )}

        {(!users || users.length === 0) && !loading && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <UsersIcon className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-600 text-xl font-semibold mb-2">
              No users found
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Click "Add New User" to create your first user
            </p>
            <button
              onClick={handleAddNew}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-all shadow-sm font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add First User
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Page info */}
            <div className="text-sm text-gray-600">
              Page{" "}
              <span className="font-semibold text-[#1a365d]">
                {pagination.current_page}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#1a365d]">
                {pagination.last_page}
              </span>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center gap-2">
              {/* Previous button */}
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      typeof page === "number" && handlePageChange(page)
                    }
                    disabled={
                      page === "..." || page === pagination.current_page
                    }
                    className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-all ${
                      page === pagination.current_page
                        ? "bg-[#1a365d] text-white"
                        : page === "..."
                          ? "cursor-default"
                          : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              {/* Next button */}
              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Jump to page */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Go to:</label>
              <input
                type="number"
                min={1}
                max={pagination.last_page}
                placeholder="Page"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const page = parseInt((e.target as HTMLInputElement).value);
                    if (page >= 1 && page <= pagination.last_page) {
                      handlePageChange(page);
                      (e.target as HTMLInputElement).value = "";
                    }
                  }
                }}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditMode ? "Edit User" : "Add New User"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditMode(false);
                  setEditingUserId(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <fieldset disabled={isSubmitting || loading} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password{" "}
                    {!isEditMode && <span className="text-red-500">*</span>}
                    {isEditMode && (
                      <span className="text-gray-500 text-xs">
                        (Leave blank to keep current)
                      </span>
                    )}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!isEditMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password{" "}
                    {!isEditMode && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleInputChange}
                    required={!isEditMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d] capitalize"
                  >
                    {getAvailableRoles().map((role) => (
                      <option key={role} value={role} className="capitalize">
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    name="student_id"
                    value={formData.student_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                  />
                </div>
              </div>

              {/* Branch Selection */}
              {isSuperadmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch{" "}
                    {formData.role !== "superadmin" && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <select
                    name="branch"
                    value={formData.branch || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        branch: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                        enrolled_courses: [], // Reset enrolled courses when branch changes
                      })
                    }
                    required={formData.role !== "superadmin"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                  >
                    <option value="">Select Branch</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name} ({branch.code})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.role === "superadmin"
                      ? "Superadmin users don't need branch assignment"
                      : "Select which branch this user belongs to"}
                  </p>
                </div>
              )}

              {isAdmin && currentUser?.branch_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={currentUser?.branch || "Your Branch"}
                      disabled
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-medium"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Building2 className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Users will be created for your branch:{" "}
                    <span className="font-semibold text-purple-700">
                      {currentUser?.branch}
                    </span>
                  </p>
                </div>
              )}

              {isTeacher && currentUser?.branch_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={currentUser?.branch || "Your Branch"}
                      disabled
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-medium"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Building2 className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Students will be created for your branch:{" "}
                    <span className="font-semibold text-purple-700">
                      {currentUser?.branch}
                    </span>
                  </p>
                </div>
              )}

              {/* Show branch info for students (read-only when editing) */}
              {formData.role === "student" && isEditMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={
                        isSuperadmin
                          ? branches.find((b) => b.id === formData.branch)
                              ?.name || "Not assigned"
                          : currentUser?.branch || "Not assigned"
                      }
                      disabled
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Building2 className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Student's branch assignment (cannot be changed after
                    creation)
                  </p>
                </div>
              )}

              {/* Enrolled Courses (for students only) */}
              {formData.role === "student" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enrolled Courses
                  </label>
                  <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
                    {(() => {
                      // Determine which branch to filter by
                      let branchToFilter = null;

                      if (isSuperadmin) {
                        branchToFilter = formData.branch;
                      } else if (isAdmin || isTeacher) {
                        // For admin and teacher, use their branch_id
                        branchToFilter = currentUser?.branch_id;
                      }

                      const availableCourses = courses.filter((c) => {
                        if (!c.is_active) return false;
                        if (branchToFilter) {
                          return c.branch === branchToFilter;
                        }
                        return false;
                      });

                      if (!branchToFilter) {
                        return (
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-500 mb-2">
                              {isSuperadmin
                                ? "Please select a branch first"
                                : "Loading branch information..."}
                            </p>
                            {isAdmin && (
                              <p className="text-xs text-gray-400">
                                Your branch:{" "}
                                {currentUser?.branch || "Not assigned"}
                              </p>
                            )}
                          </div>
                        );
                      }

                      if (availableCourses.length === 0) {
                        return (
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-500 mb-2">
                              No courses available for this branch
                            </p>
                            <p className="text-xs text-gray-400">
                              Branch ID: {branchToFilter}
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-2">
                          {availableCourses.map((course) => (
                            <label
                              key={course.id}
                              className="flex items-center gap-2 p-2 hover:bg-white rounded cursor-pointer transition"
                            >
                              <input
                                type="checkbox"
                                checked={formData.enrolled_courses.includes(
                                  course.id,
                                )}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      enrolled_courses: [
                                        ...formData.enrolled_courses,
                                        course.id,
                                      ],
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      enrolled_courses:
                                        formData.enrolled_courses.filter(
                                          (id) => id !== course.id,
                                        ),
                                    });
                                  }
                                }}
                                className="w-4 h-4 text-[#1a365d] border-gray-300 rounded focus:ring-[#1a365d]"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-4 h-4 text-gray-500" />
                                  <span className="text-sm font-medium text-gray-800">
                                    {course.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                    {course.course_type}
                                  </span>
                                  {course.branch_name && (
                                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded flex items-center gap-1">
                                      <Building2 className="w-3 h-3" />
                                      {course.branch_name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Select courses this student will be enrolled in
                    {(isAdmin || isTeacher) && currentUser?.branch && (
                      <span className="font-semibold text-purple-700">
                        {" "}
                        (from {currentUser.branch})
                      </span>
                    )}
                  </p>
                </div>
              )}

              </fieldset>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading || isSubmitting}
                  className="flex-1 bg-[#1a365d] text-white px-4 py-2 rounded-lg hover:bg-[#2c5282] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading || isSubmitting
                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."
                    : isEditMode
                      ? "Update User"
                      : "Create User"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    setEditingUserId(null);
                    setIsSubmitting(false);
                  }}
                  disabled={loading || isSubmitting}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;

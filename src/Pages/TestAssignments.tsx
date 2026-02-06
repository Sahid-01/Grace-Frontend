import { useEffect, useState, useRef } from "react";
import { useTestAttemptsStore } from "@/stores/Test/TestAttempts";
import { useTestsStore } from "@/stores/Test/Tests";
import { useUsersStore } from "@/stores/Auth/Users";
import { useAuthStore } from "@/stores/Auth/auth";
import {
  Users,
  Plus,
  Trash2,
  X,
  Search,
  Filter,
  CheckCircle,
  Clock,
} from "lucide-react";

const TestAssignments = () => {
  const { user: currentUser } = useAuthStore();
  const {
    testAttempts,
    loading,
    error,
    fetchTestAttempts,
    createTestAttempt,
    deleteTestAttempt,
  } = useTestAttemptsStore();
  const { tests } = useTestsStore();
  const { users } = useUsersStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasFetched = useRef(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearchQuery, setTempSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [formData, setFormData] = useState({
    test_id: "",
    student_id: "",
  });

  useEffect(() => {
    if (!hasFetched.current) {
      fetchTestAttempts();
      hasFetched.current = true;
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.test_id || !formData.student_id) {
      alert("Please select both test and student");
      return;
    }

    await createTestAttempt({
      test: Number(formData.test_id),
      student: Number(formData.student_id),
      started_at: new Date().toISOString(),
      is_completed: false,
    });

    if (!error) {
      setIsModalOpen(false);
      setFormData({ test_id: "", student_id: "" });
      fetchTestAttempts();
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to remove this assignment?")) {
      await deleteTestAttempt(id);
      fetchTestAttempts();
    }
  };

  const applyFilters = () => {
    setSearchQuery(tempSearchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  const students = Array.isArray(users)
    ? users.filter((u) => u.role?.toLowerCase() === "student")
    : [];

  const filteredAttempts = Array.isArray(testAttempts)
    ? testAttempts.filter((attempt) => {
        const test = tests?.find((t) => t.id === attempt.test);
        const student = students.find((s) => s.id === attempt.student);
        const matchesSearch =
          test?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student?.username.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
          filterStatus === "all" ||
          (filterStatus === "in_progress" && !attempt.is_completed) ||
          (filterStatus === "completed" && attempt.is_completed);
        return matchesSearch && matchesStatus;
      })
    : [];

  const canManage =
    currentUser?.role &&
    ["admin", "teacher"].includes(currentUser.role.toLowerCase());

  if (loading && (!testAttempts || testAttempts.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-[#1a365d] border-r-[#2c5282] animate-spin"></div>
          </div>
          <p className="text-gray-700 font-semibold text-lg">
            Loading assignments...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a365d] to-[#2c5282] rounded-lg shadow-md p-6 mb-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Test Assignments
              </h1>
              <p className="text-blue-100 mt-1">Assign tests to students</p>
            </div>
          </div>
          {canManage && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-white text-[#1a365d] px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-all font-semibold shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Assign Test
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        </div>
      )}

      {/* Assignments Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-[#1a365d]" />
            <h3 className="text-sm font-semibold text-gray-800">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
            >
              <option value="all">All Status</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <button
              onClick={applyFilters}
              className="px-3 py-2 text-sm bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-all font-medium"
            >
              <Search className="w-4 h-4 inline mr-2" />
              Search
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Test
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Student
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Start Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAttempts.map((attempt) => {
                const test = tests?.find((t) => t.id === attempt.test);
                const student = students.find((s) => s.id === attempt.student);
                return (
                  <tr
                    key={attempt.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        {test?.title}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700">{student?.username}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          attempt.is_completed
                            ? "bg-green-50 text-green-700"
                            : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {attempt.is_completed ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        {attempt.is_completed ? "Completed" : "In Progress"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(attempt.started_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {canManage && (
                        <button
                          onClick={() => handleDelete(attempt.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAttempts.length === 0 &&
          testAttempts.length > 0 &&
          !loading && (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-semibold">
                No assignments match your search
              </p>
            </div>
          )}

        {(!testAttempts || testAttempts.length === 0) && !loading && (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold">
              No test assignments yet
            </p>
            {canManage && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-all shadow-sm font-semibold"
              >
                <Plus className="w-5 h-5" />
                Assign First Test
              </button>
            )}
          </div>
        )}
      </div>

      {/* Assign Test Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Assign Test</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setFormData({ test_id: "", student_id: "" });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Test <span className="text-red-500">*</span>
                </label>
                <select
                  name="test_id"
                  value={formData.test_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                >
                  <option value="">Choose a test...</option>
                  {tests?.map((test) => (
                    <option key={test.id} value={test.id}>
                      {test.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Student <span className="text-red-500">*</span>
                </label>
                <select
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                >
                  <option value="">Choose a student...</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.first_name} {student.last_name} (@
                      {student.username})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-all font-semibold"
                >
                  Assign Test
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormData({ test_id: "", student_id: "" });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
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

export default TestAssignments;

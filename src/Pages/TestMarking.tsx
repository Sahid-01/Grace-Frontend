import { useEffect, useState, useRef } from "react";
import { useTestResultsStore } from "@/stores/Test/TestResults";
import { useTestAttemptsStore } from "@/stores/Test/TestAttempts";
import { useAuthStore } from "@/stores/Auth/auth";
import {
  CheckCircle,
  XCircle,
  X,
  Search,
  Filter,
  Award,
  Edit,
} from "lucide-react";

const TestMarking = () => {
  const { user: currentUser } = useAuthStore();
  const {
    testResults,
    loading,
    error,
    fetchTestResults,
    updateTestResult,
    clearError,
  } = useTestResultsStore();
  const { testAttempts } = useTestAttemptsStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const hasFetched = useRef(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearchQuery, setTempSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");

  const [markingData, setMarkingData] = useState({
    obtained_score: 0,
    feedback: "",
  });

  useEffect(() => {
    if (!hasFetched.current) {
      fetchTestResults();
      hasFetched.current = true;
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setMarkingData((prev) => ({
      ...prev,
      [name]: name === "obtained_score" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !currentUser?.role ||
      !["admin", "teacher"].includes(currentUser.role.toLowerCase())
    ) {
      alert("Only admin and teachers can mark tests");
      return;
    }

    if (!selectedResult) return;

    await updateTestResult(selectedResult.id, {
      obtained_score: markingData.obtained_score,
      status: "published",
    });

    if (!error) {
      setIsModalOpen(false);
      setSelectedResult(null);
      setMarkingData({ obtained_score: 0, feedback: "" });
      fetchTestResults();
    }
  };

  const handleEdit = (result: any) => {
    setSelectedResult(result);
    setMarkingData({
      obtained_score: result.obtained_score || 0,
      feedback: "",
    });
    clearError();
    setIsModalOpen(true);
  };

  const applyFilters = () => {
    setSearchQuery(tempSearchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  const filteredResults = Array.isArray(testResults)
    ? testResults.filter((result) => {
        const attempt = testAttempts?.find(
          (a) => a.id === result.test_attempt_id,
        );
        const matchesSearch =
          attempt?.id.toString().includes(searchQuery) ||
          result.id.toString().includes(searchQuery);
        const matchesStatus =
          filterStatus === "all" || result.status === filterStatus;
        return matchesSearch && matchesStatus;
      })
    : [];

  const canMark =
    currentUser?.role &&
    ["admin", "teacher"].includes(currentUser.role.toLowerCase());

  if (loading && (!testResults || testResults.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-[#1a365d] border-r-[#2c5282] animate-spin"></div>
          </div>
          <p className="text-gray-700 font-semibold text-lg">
            Loading test results...
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
              <Award className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Test Marking</h1>
              <p className="text-blue-100 mt-1">
                Mark and evaluate student tests
              </p>
            </div>
          </div>
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

      {/* Results Table */}
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
                onKeyDown={handleKeyDown}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="published">Published</option>
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
                  Attempt ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Total Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Obtained Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Percentage
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredResults.map((result) => (
                <tr
                  key={result.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">
                      #{result.test_attempt_id}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {result.total_score}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">
                      {result.obtained_score || "-"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">
                      {result.percentage
                        ? `${result.percentage.toFixed(2)}%`
                        : "-"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        result.status === "published"
                          ? "bg-green-50 text-green-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {result.status === "published" ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      {result.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {canMark && result.status === "pending" && (
                      <button
                        onClick={() => handleEdit(result)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                        title="Mark"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredResults.length === 0 && testResults.length > 0 && !loading && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold">
              No results match your search
            </p>
          </div>
        )}

        {(!testResults || testResults.length === 0) && !loading && (
          <div className="text-center py-16">
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold">
              No test results yet
            </p>
          </div>
        )}
      </div>

      {/* Marking Modal */}
      {isModalOpen && selectedResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Mark Test</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedResult(null);
                  setMarkingData({ obtained_score: 0, feedback: "" });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  Total Score:{" "}
                  <span className="font-bold text-gray-900">
                    {selectedResult.total_score}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Obtained Score <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="obtained_score"
                  value={markingData.obtained_score}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max={selectedResult.total_score}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback
                </label>
                <textarea
                  name="feedback"
                  value={markingData.feedback}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                  placeholder="Add feedback for the student..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-all font-semibold"
                >
                  Mark & Publish
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedResult(null);
                    setMarkingData({ obtained_score: 0, feedback: "" });
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

export default TestMarking;

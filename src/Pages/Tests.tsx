import { useEffect, useState, useRef } from "react";
import { useTestsStore } from "@/stores/Test/Tests";
import { BookOpen, Plus, Trash2, X, Edit, Search, Filter } from "lucide-react";

const Tests = () => {
  const {
    tests,
    loading,
    error,
    fetchTests,
    deleteTest,
    createTest,
    updateTest,
    clearError,
  } = useTestsStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTestId, setEditingTestId] = useState<number | null>(null);
  const hasFetched = useRef(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearchQuery, setTempSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course: 1,
    test_kind: "mock",
    total_marks: 100,
    duration_minutes: 60,
    is_active: true,
  });

  useEffect(() => {
    if (!hasFetched.current) {
      fetchTests();
      hasFetched.current = true;
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
            ? Number(value)
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formData.title.trim()) {
      alert("Please enter test title");
      return;
    }

    if (!formData.course || formData.course < 1) {
      alert("Please enter valid course ID");
      return;
    }

    if (!formData.test_kind) {
      alert("Please select test kind");
      return;
    }

    if (!formData.total_marks || formData.total_marks < 1) {
      alert("Please enter valid total marks");
      return;
    }

    if (!formData.duration_minutes || formData.duration_minutes < 1) {
      alert("Please enter valid duration");
      return;
    }

    clearError();

    try {
      const typedFormData = {
        ...formData,
        test_kind: formData.test_kind as "mock" | "practice" | "sectional",
      };

      if (isEditMode && editingTestId) {
        await updateTest(editingTestId, typedFormData);
      } else {
        await createTest(typedFormData);
      }

      // Wait for state update
      setTimeout(() => {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingTestId(null);
        setFormData({
          title: "",
          description: "",
          course: 1,
          test_kind: "mock",
          total_marks: 100,
          duration_minutes: 60,
          is_active: true,
        });
        fetchTests();
      }, 500);
    } catch (err) {
      console.error("Form submission error:", err);
    }
  };

  const handleEdit = (test: any) => {
    setIsEditMode(true);
    setEditingTestId(test.id);
    setFormData({
      title: test.title,
      description: test.description,
      course: test.course,
      test_kind: test.test_kind,
      total_marks: test.total_marks,
      duration_minutes: test.duration_minutes,
      is_active: test.is_active,
    });
    clearError();
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setIsEditMode(false);
    setEditingTestId(null);
    setFormData({
      title: "",
      description: "",
      course: 1,
      test_kind: "IELTS",
      total_marks: 100,
      duration_minutes: 60,
      is_active: true,
    });
    clearError();
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this test?")) {
      await deleteTest(id);
      fetchTests();
    }
  };

  const applyFilters = () => {
    setSearchQuery(tempSearchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  const filteredTests = Array.isArray(tests)
    ? tests.filter((test) =>
        test.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  // Allow test management - role check will be done on backend
  const canManageTests = true;

  if (loading && (!tests || tests.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-[#1a365d] border-r-[#2c5282] animate-spin"></div>
          </div>
          <p className="text-gray-700 font-semibold text-lg">
            Loading tests...
          </p>
          <p className="text-gray-500 text-sm mt-2">Please wait a moment</p>
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
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Test Management
              </h1>
              <p className="text-blue-100 mt-1">Create and manage tests</p>
            </div>
          </div>
          {canManageTests && (
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-white text-[#1a365d] px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-all font-semibold shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Create Test
            </button>
          )}
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

      {/* Tests Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {/* Filters Section */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#1a365d]" />
              <h3 className="text-sm font-semibold text-gray-800">Filters</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tests..."
                value={tempSearchQuery}
                onChange={(e) => setTempSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
              />
            </div>

            <button
              onClick={applyFilters}
              className="px-3 py-2 text-sm bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-all font-medium flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Total Marks
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Duration
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
              {filteredTests.map((test) => (
                <tr
                  key={test.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {test.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {test.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {test.total_marks}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {test.duration_minutes} mins
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        test.is_active
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {test.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {canManageTests && (
                        <>
                          <button
                            onClick={() => handleEdit(test)}
                            className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-all"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(test.id)}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTests.length === 0 && tests.length > 0 && !loading && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold">
              No tests match your search
            </p>
          </div>
        )}

        {(!tests || tests.length === 0) && !loading && (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold">
              No tests found
            </p>
            {canManageTests && (
              <button
                onClick={handleAddNew}
                className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-all shadow-sm font-semibold"
              >
                <Plus className="w-5 h-5" />
                Create First Test
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Test Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditMode ? "Edit Test" : "Create New Test"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditMode(false);
                  setEditingTestId(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Kind <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="test_kind"
                    value={formData.test_kind}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                  >
                    <option value="mock">Mock Test</option>
                    <option value="practice">Practice Test</option>
                    <option value="sectional">Sectional Test</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="total_marks"
                    value={formData.total_marks}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="duration_minutes"
                    value={formData.duration_minutes}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 text-[#1a365d] focus:ring-[#1a365d]"
                />
                <label
                  htmlFor="is_active"
                  className="text-sm font-medium text-gray-700"
                >
                  Active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-all font-semibold"
                >
                  {isEditMode ? "Update Test" : "Create Test"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    setEditingTestId(null);
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

export default Tests;

import { useEffect, useState, useRef } from "react";
import { useTestSectionsStore } from "@/stores/Test/TestSections";
import { useTestsStore } from "@/stores/Test/Tests";
import { useSectionsStore } from "@/stores/Classes/Sections";
import { BookOpen, Plus, Trash2, X, Edit, Search, Filter } from "lucide-react";

const TestSections = () => {
  const {
    testSections,
    loading,
    error,
    fetchTestSections,
    deleteTestSection,
    createTestSection,
    updateTestSection,
    clearError,
  } = useTestSectionsStore();
  const { tests } = useTestsStore();
  const { sections } = useSectionsStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const hasFetched = useRef(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearchQuery, setTempSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    test: 1,
    section: 1,
    total_marks: 100,
    duration_minutes: 60,
  });

  useEffect(() => {
    if (!hasFetched.current) {
      fetchTestSections();
      hasFetched.current = true;
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.currentTarget;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.test || !formData.section) {
      alert("Please select both a test and a section");
      return;
    }

    if (formData.total_marks <= 0) {
      alert("Total marks must be greater than 0");
      return;
    }

    if (formData.duration_minutes <= 0) {
      alert("Duration must be greater than 0");
      return;
    }

    // Check for duplicate in create mode
    if (!isEditMode) {
      const exists = testSections.some(
        (ts) => ts.test === formData.test && ts.section === formData.section,
      );
      if (exists) {
        alert("This test-section combination already exists");
        return;
      }
    }

    if (isEditMode && editingId) {
      await updateTestSection(editingId, formData);
    } else {
      await createTestSection(formData);
    }

    if (!error) {
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingId(null);
      setFormData({
        test: 1,
        section: 1,
        total_marks: 100,
        duration_minutes: 60,
      });
      fetchTestSections();
    }
  };

  const handleEdit = (section: any) => {
    setIsEditMode(true);
    setEditingId(section.id);
    setFormData({
      test: section.test,
      section: section.section,
      total_marks: section.total_marks,
      duration_minutes: section.duration_minutes,
    });
    clearError();
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({
      test: 1,
      section: 1,
      total_marks: 100,
      duration_minutes: 60,
    });
    clearError();
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      await deleteTestSection(id);
      fetchTestSections();
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

  const filteredSections = Array.isArray(testSections)
    ? testSections.filter((section) => {
        const sectionData = sections?.find(
          (s: any) => s.id === section.section,
        );
        const sectionName = sectionData?.name || "";
        return sectionName.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : [];

  if (loading && (!testSections || testSections.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-[#1a365d] border-r-[#2c5282] animate-spin"></div>
          </div>
          <p className="text-gray-700 font-semibold text-lg">
            Loading sections...
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
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Test Sections</h1>
              <p className="text-blue-100 mt-1">Manage test sections</p>
            </div>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-white text-[#1a365d] px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-all font-semibold shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add Section
          </button>
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

      {/* Table */}
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
                placeholder="Search sections..."
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
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Section
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Test
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Marks
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Duration
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSections.map((section) => {
                const test = tests?.find((t) => t.id === section.test);
                const sectionData = sections?.find(
                  (s: any) => s.id === section.section,
                );
                return (
                  <tr
                    key={section.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {sectionData?.name}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{test?.title}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {section.total_marks}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {section.duration_minutes} mins
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(section)}
                          className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-all"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(section.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredSections.length === 0 &&
          testSections.length > 0 &&
          !loading && (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-semibold">
                No sections match your search
              </p>
            </div>
          )}

        {(!testSections || testSections.length === 0) && !loading && (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold">
              No sections found
            </p>
            <button
              onClick={handleAddNew}
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-all shadow-sm font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add First Section
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditMode ? "Edit Section" : "Add Section"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditMode(false);
                  setEditingId(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border-b border-red-200 px-6 py-3">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test <span className="text-red-500">*</span>
                </label>
                <select
                  name="test"
                  value={formData.test}
                  onChange={handleInputChange}
                  required
                  disabled={loading || !tests || tests.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d] disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select a test</option>
                  {tests?.map((test) => (
                    <option key={test.id} value={test.id}>
                      {test.title}
                    </option>
                  ))}
                </select>
                {!tests ||
                  (tests.length === 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      No tests available. Create a test first.
                    </p>
                  ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section <span className="text-red-500">*</span>
                </label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  required
                  disabled={loading || !sections || sections.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d] disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select a section</option>
                  {sections?.map((section: any) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
                {!sections ||
                  (sections.length === 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      No sections available. Create a section first.
                    </p>
                  ))}
              </div>

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
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d] disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d] disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-all font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {isEditMode ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    setEditingId(null);
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold disabled:bg-gray-100 disabled:cursor-not-allowed"
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

export default TestSections;

import { useEffect, useState, useRef } from "react";
import { useQuestionOptionsStore } from "@/stores/Test/QuestionOptions";
import { useQuestionsStore } from "@/stores/Test/Questions";
import {
  List,
  Plus,
  Trash2,
  X,
  Edit,
  Search,
  Filter,
  CheckCircle,
} from "lucide-react";

const QuestionOptions = () => {
  const {
    questionOptions,
    loading,
    error,
    fetchQuestionOptions,
    deleteQuestionOption,
    createQuestionOption,
    updateQuestionOption,
    clearError,
  } = useQuestionOptionsStore();
  const { questions } = useQuestionsStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const hasFetched = useRef(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearchQuery, setTempSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    question: 1,
    option_text: "",
    is_correct: false,
  });

  useEffect(() => {
    if (!hasFetched.current) {
      fetchQuestionOptions();
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
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditMode && editingId) {
      await updateQuestionOption(editingId, formData);
    } else {
      await createQuestionOption(formData);
    }

    if (!error) {
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingId(null);
      setFormData({
        question: 1,
        option_text: "",
        is_correct: false,
      });
      fetchQuestionOptions();
    }
  };

  const handleEdit = (option: any) => {
    setIsEditMode(true);
    setEditingId(option.id);
    setFormData({
      question: option.question,
      option_text: option.option_text,
      is_correct: option.is_correct,
    });
    clearError();
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({
      question: 1,
      option_text: "",
      is_correct: false,
    });
    clearError();
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this option?")) {
      await deleteQuestionOption(id);
      fetchQuestionOptions();
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

  const filteredOptions = Array.isArray(questionOptions)
    ? questionOptions.filter((opt) =>
        opt.option_text.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  if (loading && (!questionOptions || questionOptions.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-[#1a365d] border-r-[#2c5282] animate-spin"></div>
          </div>
          <p className="text-gray-700 font-semibold text-lg">
            Loading options...
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
              <List className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Question Options
              </h1>
              <p className="text-blue-100 mt-1">Manage question options</p>
            </div>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-white text-[#1a365d] px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-all font-semibold shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add Option
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
                placeholder="Search options..."
                value={tempSearchQuery}
                onChange={(e) => setTempSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
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
                  Option Text
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Question
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Correct
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOptions.map((option) => {
                const question = questions?.find(
                  (q) => q.id === option.question,
                );
                return (
                  <tr
                    key={option.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 line-clamp-2">
                        {option.option_text}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-sm">
                      {question?.question_text.substring(0, 50)}...
                    </td>
                    <td className="px-6 py-4">
                      {option.is_correct ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(option)}
                          className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-all"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(option.id)}
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

        {filteredOptions.length === 0 &&
          questionOptions.length > 0 &&
          !loading && (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-semibold">
                No options match your search
              </p>
            </div>
          )}

        {(!questionOptions || questionOptions.length === 0) && !loading && (
          <div className="text-center py-16">
            <List className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold">
              No options found
            </p>
            <button
              onClick={handleAddNew}
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-all shadow-sm font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add First Option
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
                {isEditMode ? "Edit Option" : "Add Option"}
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

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question <span className="text-red-500">*</span>
                </label>
                <select
                  name="question"
                  value={formData.question}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                >
                  {questions?.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.question_text.substring(0, 50)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Option Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="option_text"
                  value={formData.option_text}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_correct"
                  id="is_correct"
                  checked={formData.is_correct}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 text-[#1a365d] focus:ring-[#1a365d]"
                />
                <label
                  htmlFor="is_correct"
                  className="text-sm font-medium text-gray-700"
                >
                  This is the correct answer
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-all font-semibold"
                >
                  {isEditMode ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    setEditingId(null);
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

export default QuestionOptions;

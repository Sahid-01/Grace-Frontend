import { useEffect, useState, useRef } from "react";
import { useQuestionsStore } from "@/stores/Test/Questions";
import { useTestSectionsStore } from "@/stores/Test/TestSections";
import {
  HelpCircle,
  Plus,
  Trash2,
  X,
  Edit,
  Search,
  Filter,
} from "lucide-react";

const Questions = () => {
  const {
    questions,
    loading,
    error,
    fetchQuestions,
    deleteQuestion,
    createQuestion,
    updateQuestion,
    clearError,
  } = useQuestionsStore();
  const { testSections } = useTestSectionsStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const hasFetched = useRef(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearchQuery, setTempSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    test_section: 1,
    question_text: "",
    question_type: "mcq",
    marks: 1,
    order: 1,
    correct_answer: "",
  });

  useEffect(() => {
    if (!hasFetched.current) {
      fetchQuestions();
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
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const typedFormData = {
      ...formData,
      question_type: formData.question_type as
        | "mcq"
        | "text"
        | "essay"
        | "audio",
    };

    if (isEditMode && editingId) {
      await updateQuestion(editingId, typedFormData);
    } else {
      await createQuestion(typedFormData);
    }

    if (!error) {
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingId(null);
      setFormData({
        test_section: 1,
        question_text: "",
        question_type: "mcq",
        marks: 1,
        order: 1,
        correct_answer: "",
      });
      fetchQuestions();
    }
  };

  const handleEdit = (question: any) => {
    setIsEditMode(true);
    setEditingId(question.id);
    setFormData({
      test_section: question.test_section,
      question_text: question.question_text,
      question_type: question.question_type,
      marks: question.marks,
      order: question.order,
      correct_answer: question.correct_answer || "",
    });
    clearError();
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setIsEditMode(false);
    setEditingId(null);
    setFormData({
      test_section: 1,
      question_text: "",
      question_type: "MCQ",
      marks: 1,
      order: 1,
      correct_answer: "",
    });
    clearError();
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      await deleteQuestion(id);
      fetchQuestions();
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

  const filteredQuestions = Array.isArray(questions)
    ? questions.filter((q) =>
        q.question_text.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  if (loading && (!questions || questions.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-[#1a365d] border-r-[#2c5282] animate-spin"></div>
          </div>
          <p className="text-gray-700 font-semibold text-lg">
            Loading questions...
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
              <HelpCircle className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Questions</h1>
              <p className="text-blue-100 mt-1">Manage test questions</p>
            </div>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-white text-[#1a365d] px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-all font-semibold shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add Question
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
                placeholder="Search questions..."
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
                  Question
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Marks
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Order
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredQuestions.map((question) => (
                <tr
                  key={question.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900 line-clamp-2">
                      {question.question_text}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                      {question.question_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{question.marks}</td>
                  <td className="px-6 py-4 text-gray-700">{question.order}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(question)}
                        className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-all"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredQuestions.length === 0 && questions.length > 0 && !loading && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold">
              No questions match your search
            </p>
          </div>
        )}

        {(!questions || questions.length === 0) && !loading && (
          <div className="text-center py-16">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold">
              No questions found
            </p>
            <button
              onClick={handleAddNew}
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-all shadow-sm font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add First Question
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditMode ? "Edit Question" : "Add Question"}
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
                  Test Section <span className="text-red-500">*</span>
                </label>
                <select
                  name="test_section"
                  value={formData.test_section}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                >
                  {testSections?.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.section_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="question_text"
                  value={formData.question_text}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="question_type"
                    value={formData.question_type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                  >
                    <option value="mcq">Multiple Choice</option>
                    <option value="text">Text Answer</option>
                    <option value="essay">Essay</option>
                    <option value="audio">Audio Based</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="marks"
                    value={formData.marks}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correct Answer
                </label>
                <input
                  type="text"
                  name="correct_answer"
                  value={formData.correct_answer}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                />
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

export default Questions;

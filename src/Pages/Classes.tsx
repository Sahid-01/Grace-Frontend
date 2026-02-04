import { useEffect, useState, useRef } from "react";
import { useCoursesStore } from "@/stores/Course";
import { useSectionsStore } from "@/stores/Sections";
import { useLessonsStore } from "@/stores/Lessions";
import type { LessonFormData } from "@/stores/Lessions";
import { useAuthStore } from "@/stores/auth";
import {
  BookOpen,
  Plus,
  Trash2,
  X,
  Edit,
  ChevronDown,
  ChevronRight,
  List,
  FileText,
  PlayCircle,
} from "lucide-react";

const Class = () => {
  const { user } = useAuthStore();
  const {
    courses,
    loading: coursesLoading,
    error: coursesError,
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    clearError: clearCourseError,
  } = useCoursesStore();
  const {
    sections,
    loading: sectionsLoading,
    fetchSections,
    createSection,
    updateSection,
    deleteSection,
  } = useSectionsStore();
  const {
    lessons,
    loading: lessonsLoading,
    fetchLessons,
    createLesson,
    updateLesson,
    deleteLesson,
  } = useLessonsStore();

  const isStudent = user?.role === "student" || user?.student_id;

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(
    new Set(),
  );
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set(),
  );
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const hasFetched = useRef(false);

  const [courseFormData, setCourseFormData] = useState({
    title: "",
    description: "",
    course_type: "IELTS" as "IELTS" | "PTE",
    is_active: true,
  });

  const [sectionFormData, setSectionFormData] = useState({
    name: "listening" as "listening" | "reading" | "writing" | "speaking",
    course: 0,
    is_active: true,
  });

  const [lessonFormData, setLessonFormData] = useState({
    title: "",
    content: "",
    section: 0,
    order: 1,
    file: null as File | null,
    is_active: true,
  });

  useEffect(() => {
    if (!hasFetched.current) {
      fetchCourses();
      fetchSections();
      fetchLessons();
      hasFetched.current = true;
    }
  }, []);

  // Close video modal on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isVideoModalOpen) {
        closeVideoModal();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isVideoModalOpen]);

  const toggleCourse = (courseId: number) => {
    setExpandedCourses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && editingId) {
      await updateCourse(editingId, courseFormData);
    } else {
      await createCourse(courseFormData);
    }
    if (!coursesError) {
      setIsCourseModalOpen(false);
      setCourseFormData({
        title: "",
        description: "",
        course_type: "IELTS",
        is_active: true,
      });
      setIsEditMode(false);
      setEditingId(null);
      fetchCourses();
    }
  };

  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && editingId) {
      await updateSection(editingId, sectionFormData);
    } else {
      await createSection(sectionFormData);
    }
    setIsSectionModalOpen(false);
    setSectionFormData({ name: "listening", course: 0, is_active: true });
    setIsEditMode(false);
    setEditingId(null);
    fetchSections();
  };

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare lesson data with file if present
    const lessonData: LessonFormData = {
      title: lessonFormData.title,
      content: lessonFormData.content,
      section: lessonFormData.section,
      order: lessonFormData.order,
      is_active: lessonFormData.is_active,
    };

    // Add file if selected
    if (lessonFormData.file) {
      lessonData.file = lessonFormData.file;
    }

    if (isEditMode && editingId) {
      await updateLesson(editingId, lessonData);
    } else {
      await createLesson(lessonData);
    }
    setIsLessonModalOpen(false);
    setLessonFormData({
      title: "",
      content: "",
      section: 0,
      order: 1,
      file: null,
      is_active: true,
    });
    setIsEditMode(false);
    setEditingId(null);
    fetchLessons();
  };

  const handleEditCourse = (course: any) => {
    setIsEditMode(true);
    setEditingId(course.id);
    setCourseFormData({
      title: course.title,
      description: course.description || "",
      course_type: course.course_type || "IELTS",
      is_active: course.is_active ?? true,
    });
    clearCourseError();
    setIsCourseModalOpen(true);
  };

  const handleDeleteCourse = async (id: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this course? All sections and lessons will be removed.",
      )
    ) {
      await deleteCourse(id);
      fetchCourses();
    }
  };

  const handleAddSection = (courseId: number) => {
    setSectionFormData({ ...sectionFormData, course: courseId });
    setIsSectionModalOpen(true);
  };

  const handleEditSection = (section: any) => {
    setIsEditMode(true);
    setEditingId(section.id);
    setSectionFormData({
      name: section.name || "listening",
      course: section.course,
      is_active: section.is_active ?? true,
    });
    setIsSectionModalOpen(true);
  };

  const handleDeleteSection = async (id: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this section? All lessons will be removed.",
      )
    ) {
      await deleteSection(id);
      fetchSections();
    }
  };

  const handleAddLesson = (sectionId: number) => {
    setLessonFormData({ ...lessonFormData, section: sectionId });
    setIsLessonModalOpen(true);
  };

  const handleEditLesson = (lesson: any) => {
    setIsEditMode(true);
    setEditingId(lesson.id);
    setLessonFormData({
      title: lesson.title,
      content: lesson.content || "",
      section: lesson.section,
      order: lesson.order || 1,
      file: null,
      is_active: lesson.is_active ?? true,
    });
    setIsLessonModalOpen(true);
  };

  const handleDeleteLesson = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      await deleteLesson(id);
      fetchLessons();
    }
  };

  const getCourseSections = (courseId: number) => {
    return sections.filter((s) => s.course === courseId);
  };

  const getSectionLessons = (sectionId: number) => {
    return lessons
      .filter((l) => l.section === sectionId)
      .sort((a, b) => a.order - b.order);
  };

  const handleLessonClick = (lesson: any) => {
    // Fix URL if it doesn't have /media/ prefix
    if (lesson.file_url && !lesson.file_url.includes("/media/")) {
      const baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      // Remove trailing slash from baseUrl
      const cleanBaseUrl = baseUrl.replace(/\/$/, "");
      // Ensure file path starts with /
      const filePath = lesson.file.startsWith("/")
        ? lesson.file
        : `/${lesson.file}`;
      lesson.file_url = `${cleanBaseUrl}/media${filePath}`;
    }

    setSelectedLesson(lesson);
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    setSelectedLesson(null);
  };

  if (coursesLoading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  // Student View - Learning Interface
  if (isStudent) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 sm:p-8 text-white">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">My Courses</h1>
              <p className="text-blue-100 mt-1">
                Continue your learning journey
              </p>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses
            .filter((c) => c.is_active)
            .map((course) => {
              const courseSections = sections.filter(
                (s) => s.course === course.id && s.is_active,
              );
              const totalLessons = courseSections.reduce((acc, section) => {
                return (
                  acc +
                  lessons.filter((l) => l.section === section.id && l.is_active)
                    .length
                );
              }, 0);

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Course Card Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                    <div className="flex items-start justify-between mb-3">
                      <BookOpen className="w-8 h-8" />
                      <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                        {course.course_type}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                    <p className="text-blue-100 text-sm line-clamp-2">
                      {course.description}
                    </p>
                  </div>

                  {/* Course Stats */}
                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {courseSections.length} Sections
                      </span>
                      <span className="text-gray-600">
                        {totalLessons} Lessons
                      </span>
                    </div>
                  </div>

                  {/* Sections List */}
                  <div className="p-4 space-y-3">
                    {courseSections.length === 0 ? (
                      <p className="text-center text-gray-400 py-4 text-sm">
                        No sections available yet
                      </p>
                    ) : (
                      courseSections.map((section) => {
                        const sectionLessons = lessons.filter(
                          (l) => l.section === section.id && l.is_active,
                        );
                        const isExpanded = expandedSections.has(section.id);

                        return (
                          <div
                            key={section.id}
                            className="border border-gray-200 rounded-lg overflow-hidden"
                          >
                            {/* Section Header */}
                            <button
                              onClick={() => toggleSection(section.id)}
                              className="w-full p-3 bg-gray-50 hover:bg-gray-100 transition flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <List className="w-4 h-4 text-gray-600" />
                                <span className="font-medium text-gray-800 capitalize text-sm">
                                  {section.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  {sectionLessons.length} lessons
                                </span>
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-gray-600" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-600" />
                                )}
                              </div>
                            </button>

                            {/* Lessons List */}
                            {isExpanded && (
                              <div className="p-2 space-y-1 bg-white">
                                {sectionLessons.length === 0 ? (
                                  <p className="text-center text-gray-400 py-3 text-xs">
                                    No lessons available
                                  </p>
                                ) : (
                                  sectionLessons.map((lesson) => (
                                    <div
                                      key={lesson.id}
                                      onClick={() => handleLessonClick(lesson)}
                                      className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded transition cursor-pointer"
                                    >
                                      <PlayCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                      <span className="text-sm text-gray-700 flex-1">
                                        {lesson.title}
                                      </span>
                                      {lesson.file_url && (
                                        <div className="flex items-center gap-1">
                                          <FileText className="w-3 h-3 text-gray-400" />
                                          {lesson.file_type && (
                                            <span className="text-xs text-gray-500">
                                              .{lesson.file_type}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Course Action */}
                  <div className="p-4 bg-gray-50 border-t border-gray-200">
                    <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm">
                      Continue Learning
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

        {courses.filter((c) => c.is_active).length === 0 && !coursesLoading && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No courses available</p>
            <p className="text-gray-400 text-sm mt-2">
              Check back later for new courses
            </p>
          </div>
        )}

        {/* Video Player Modal */}
        {isVideoModalOpen && selectedLesson && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              // Close modal when clicking on backdrop
              if (e.target === e.currentTarget) {
                closeVideoModal();
              }
            }}
          >
            <div className="w-full max-w-6xl">
              {/* Close Button */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-white">
                  <h2 className="text-xl font-bold">{selectedLesson.title}</h2>
                  <p className="text-sm text-gray-300">
                    Lesson {selectedLesson.order}
                  </p>
                  {/* Debug Info */}
                  <p className="text-xs text-gray-400 mt-1">
                    File: {selectedLesson.file || "No file"} | URL:{" "}
                    {selectedLesson.file_url ? "Available" : "Missing"} | Type:{" "}
                    {selectedLesson.file_type || "Unknown"}
                  </p>
                </div>
                <button
                  onClick={closeVideoModal}
                  className="p-2 hover:bg-white/10 rounded-lg transition text-white"
                  aria-label="Close video player"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>

              {/* Video Player Only */}
              {selectedLesson.file_url ? (
                <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
                  <video
                    controls
                    className="w-full"
                    autoPlay
                    preload="metadata"
                    onError={(e) => {
                      console.error("Video Error:", e);
                      console.error("Video URL:", selectedLesson.file_url);
                      console.error("Video Type:", selectedLesson.file_type);
                    }}
                    onLoadStart={() => {}}
                    onCanPlay={() => {}}
                  >
                    <source
                      src={selectedLesson.file_url}
                      type={`video/${selectedLesson.file_type || "mp4"}`}
                    />
                    <source src={selectedLesson.file_url} type="video/mp4" />
                    <source src={selectedLesson.file_url} type="video/webm" />
                    <p className="text-white p-4">
                      Your browser does not support the video tag.
                    </p>
                  </video>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg p-12 text-center">
                  <PlayCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">
                    No video available for this lesson
                  </p>
                  <div className="text-xs text-gray-500 mt-4">
                    <p>File: {selectedLesson.file || "Not uploaded"}</p>
                    <p>
                      File URL: {selectedLesson.file_url || "Not generated"}
                    </p>
                  </div>
                  <button
                    onClick={closeVideoModal}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Teacher/Admin View - Management Interface
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-6 sm:p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Courses Management
              </h1>
              <p className="text-emerald-100 mt-1">
                Manage courses, sections, and lessons
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsEditMode(false);
              setEditingId(null);
              setCourseFormData({
                title: "",
                description: "",
                course_type: "IELTS",
                is_active: true,
              });
              clearCourseError();
              setIsCourseModalOpen(true);
            }}
            className="flex items-center gap-2 bg-white text-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-50 transition font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Course
          </button>
        </div>
      </div>

      {/* Error Message */}
      {coursesError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{coursesError}</p>
        </div>
      )}

      {/* Courses List */}
      <div className="space-y-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            {/* Course Header */}
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 border-b border-emerald-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleCourse(course.id)}
                    className="p-1 hover:bg-emerald-200 rounded transition"
                  >
                    {expandedCourses.has(course.id) ? (
                      <ChevronDown className="w-5 h-5 text-emerald-700" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-emerald-700" />
                    )}
                  </button>
                  <BookOpen className="w-6 h-6 text-emerald-600" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {course.description}
                      </p>
                    )}
                    <div className="flex gap-3 mt-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {course.course_type}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${course.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                      >
                        {course.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddSection(course.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Section
                  </button>
                  <button
                    onClick={() => handleEditCourse(course)}
                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sections */}
            {expandedCourses.has(course.id) && (
              <div className="p-4 space-y-3">
                {getCourseSections(course.id).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <List className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No sections yet. Add your first section!</p>
                  </div>
                ) : (
                  getCourseSections(course.id).map((section) => (
                    <div
                      key={section.id}
                      className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200"
                    >
                      {/* Section Header */}
                      <div className="p-3 bg-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            <button
                              onClick={() => toggleSection(section.id)}
                              className="p-1 hover:bg-gray-200 rounded transition"
                            >
                              {expandedSections.has(section.id) ? (
                                <ChevronDown className="w-4 h-4 text-gray-700" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-700" />
                              )}
                            </button>
                            <List className="w-5 h-5 text-gray-600" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 capitalize">
                                {section.name}
                              </h4>
                              <span
                                className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${section.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                              >
                                {section.is_active ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAddLesson(section.id)}
                              className="flex items-center gap-1 px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition"
                            >
                              <Plus className="w-3 h-3" />
                              Lesson
                            </button>
                            <button
                              onClick={() => handleEditSection(section)}
                              className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteSection(section.id)}
                              className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Lessons */}
                      {expandedSections.has(section.id) && (
                        <div className="p-3 space-y-2">
                          {getSectionLessons(section.id).length === 0 ? (
                            <div className="text-center py-6 text-gray-400 text-sm">
                              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                              <p>No lessons yet. Add your first lesson!</p>
                            </div>
                          ) : (
                            getSectionLessons(section.id).map((lesson) => (
                              <div
                                key={lesson.id}
                                className="bg-white p-3 rounded border border-gray-200 hover:border-emerald-300 transition"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-2 flex-1">
                                    <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                                    <div className="flex-1">
                                      <h5 className="font-medium text-gray-800 text-sm">
                                        {lesson.title}
                                      </h5>
                                      {lesson.content && (
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                          {lesson.content}
                                        </p>
                                      )}
                                      <div className="flex gap-2 mt-2">
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                          Order: {lesson.order}
                                        </span>
                                        {lesson.file_url && (
                                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                                            Video: .{lesson.file_type || "file"}
                                          </span>
                                        )}
                                        <span
                                          className={`text-xs px-2 py-0.5 rounded ${lesson.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                                        >
                                          {lesson.is_active
                                            ? "Active"
                                            : "Inactive"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleEditLesson(lesson)}
                                      className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteLesson(lesson.id)
                                      }
                                      className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}

        {courses.length === 0 && !coursesLoading && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No courses found</p>
            <p className="text-gray-400 text-sm mt-2">
              Click "Add Course" to create your first course
            </p>
          </div>
        )}
      </div>

      {/* Course Modal */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditMode ? "Edit Course" : "Add New Course"}
              </h2>
              <button
                onClick={() => setIsCourseModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleCourseSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={courseFormData.title}
                  onChange={(e) =>
                    setCourseFormData({
                      ...courseFormData,
                      title: e.target.value,
                    })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={courseFormData.description}
                  onChange={(e) =>
                    setCourseFormData({
                      ...courseFormData,
                      description: e.target.value,
                    })
                  }
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={courseFormData.course_type}
                    onChange={(e) =>
                      setCourseFormData({
                        ...courseFormData,
                        course_type: e.target.value as "IELTS" | "PTE",
                      })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="IELTS">IELTS</option>
                    <option value="PTE">PTE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={courseFormData.is_active ? "active" : "inactive"}
                    onChange={(e) =>
                      setCourseFormData({
                        ...courseFormData,
                        is_active: e.target.value === "active",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {coursesError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{coursesError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={coursesLoading}
                  className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition font-medium disabled:opacity-50"
                >
                  {coursesLoading
                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."
                    : isEditMode
                      ? "Update Course"
                      : "Create Course"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Section Modal */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditMode ? "Edit Section" : "Add New Section"}
              </h2>
              <button
                onClick={() => {
                  setIsSectionModalOpen(false);
                  setIsEditMode(false);
                  setEditingId(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSectionSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section Name <span className="text-red-500">*</span>
                </label>
                <select
                  value={sectionFormData.name}
                  onChange={(e) =>
                    setSectionFormData({
                      ...sectionFormData,
                      name: e.target.value as
                        | "listening"
                        | "reading"
                        | "writing"
                        | "speaking",
                    })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="listening">Listening</option>
                  <option value="reading">Reading</option>
                  <option value="writing">Writing</option>
                  <option value="speaking">Speaking</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={sectionFormData.is_active ? "active" : "inactive"}
                  onChange={(e) =>
                    setSectionFormData({
                      ...sectionFormData,
                      is_active: e.target.value === "active",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={sectionsLoading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                >
                  {sectionsLoading
                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."
                    : isEditMode
                      ? "Update Section"
                      : "Create Section"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSectionModalOpen(false);
                    setIsEditMode(false);
                    setEditingId(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditMode ? "Edit Lesson" : "Add New Lesson"}
              </h2>
              <button
                onClick={() => {
                  setIsLessonModalOpen(false);
                  setIsEditMode(false);
                  setEditingId(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleLessonSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lessonFormData.title}
                  onChange={(e) =>
                    setLessonFormData({
                      ...lessonFormData,
                      title: e.target.value,
                    })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={lessonFormData.content}
                  onChange={(e) =>
                    setLessonFormData({
                      ...lessonFormData,
                      content: e.target.value,
                    })
                  }
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={lessonFormData.order}
                    onChange={(e) =>
                      setLessonFormData({
                        ...lessonFormData,
                        order: Number(e.target.value),
                      })
                    }
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={lessonFormData.is_active ? "active" : "inactive"}
                    onChange={(e) =>
                      setLessonFormData({
                        ...lessonFormData,
                        is_active: e.target.value === "active",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video File (optional)
                </label>
                <input
                  type="file"
                  accept="video/*,.mp4,.avi,.mov,.wmv,.flv,.mkv,.webm"
                  onChange={(e) =>
                    setLessonFormData({
                      ...lessonFormData,
                      file: e.target.files?.[0] || null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: MP4, AVI, MOV, WMV, FLV, MKV, WebM
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={lessonsLoading}
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50"
                >
                  {lessonsLoading
                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."
                    : isEditMode
                      ? "Update Lesson"
                      : "Create Lesson"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLessonModalOpen(false);
                    setIsEditMode(false);
                    setEditingId(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
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

export default Class;

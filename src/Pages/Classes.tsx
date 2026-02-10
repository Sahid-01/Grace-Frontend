import { useEffect, useState } from "react";
import { useCoursesStore } from "@/stores/Classes/Course";
import { useSectionsStore } from "@/stores/Classes/Sections";
import { useLessonsStore } from "@/stores/Classes/Lessions";
import { useLessonProgressStore } from "@/stores/Classes/LessonProgress";
import type { LessonFormData } from "@/stores/Classes/Lessions";
import { useAuthStore } from "@/stores/Auth/auth";
import { useBranchStore } from "@/stores/Branch";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/Components/Toast";
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
  GraduationCap,
  Building2,
} from "lucide-react";

const Class = () => {
  const { user } = useAuthStore();
  const { toasts, addToast, removeToast } = useToast();
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
    error: sectionsError,
    fetchSections,
    createSection,
    updateSection,
    deleteSection,
  } = useSectionsStore();
  const {
    lessons,
    loading: lessonsLoading,
    error: lessonsError,
    fetchLessons,
    createLesson,
    updateLesson,
    deleteLesson,
  } = useLessonsStore();
  const { progress, fetchProgress } = useLessonProgressStore();
  const { branches, fetchBranches } = useBranchStore();

  const isStudent = user?.role === "student" || user?.student_id;
  const isSuperadmin = user?.role === "superadmin";
  const isAdmin = user?.role === "admin";

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
  const [isIntroModalOpen, setIsIntroModalOpen] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const [courseFormData, setCourseFormData] = useState({
    title: "",
    description: "",
    course_type: "IELTS" as "IELTS" | "PTE",
    branch: undefined as number | undefined,
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
    video_url: "",
    pdf_url: "",
    is_active: true,
  });

  useEffect(() => {
    if (!hasFetched) {
      fetchCourses();
      fetchSections();
      fetchLessons();
      fetchProgress();
      fetchBranches();
      setHasFetched(true);
    }
  }, []);

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

    // Clear any previous errors
    clearCourseError();

    if (isEditMode && editingId) {
      await updateCourse(editingId, courseFormData);
    } else {
      await createCourse(courseFormData);
    }

    // Check error state after operation completes
    setTimeout(() => {
      const currentError = useCoursesStore.getState().error;

      if (!currentError) {
        addToast(
          "success",
          isEditMode
            ? "Course updated successfully!"
            : "Course created successfully!",
        );
        setIsCourseModalOpen(false);
        setCourseFormData({
          title: "",
          description: "",
          course_type: "IELTS",
          branch: undefined,
          is_active: true,
        });
        setIsEditMode(false);
        setEditingId(null);
        fetchCourses();
      }
      // If there's an error, it will show in the modal
    }, 100);
  };

  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditMode && editingId) {
      await updateSection(editingId, sectionFormData);
    } else {
      await createSection(sectionFormData);
    }

    setTimeout(() => {
      const currentError = useSectionsStore.getState().error;

      if (!currentError) {
        addToast(
          "success",
          isEditMode
            ? "Section updated successfully!"
            : "Section created successfully!",
        );
        setIsSectionModalOpen(false);
        setSectionFormData({ name: "listening", course: 0, is_active: true });
        setIsEditMode(false);
        setEditingId(null);
        fetchSections();
      }
      // If there's an error, it will show in the modal
    }, 100);
  };

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const lessonData: LessonFormData = {
      title: lessonFormData.title,
      content: lessonFormData.content,
      section: lessonFormData.section,
      order: lessonFormData.order,
      is_active: lessonFormData.is_active,
    };

    if (lessonFormData.file) {
      lessonData.file = lessonFormData.file;
    }

    if (lessonFormData.video_url) {
      lessonData.video_url = lessonFormData.video_url;
    }

    if (lessonFormData.pdf_url) {
      lessonData.pdf_url = lessonFormData.pdf_url;
    }

    if (isEditMode && editingId) {
      await updateLesson(editingId, lessonData);
    } else {
      await createLesson(lessonData);
    }

    setTimeout(() => {
      const currentError = useLessonsStore.getState().error;

      if (!currentError) {
        addToast(
          "success",
          isEditMode
            ? "Lesson updated successfully!"
            : "Lesson created successfully!",
        );
        setIsLessonModalOpen(false);
        setLessonFormData({
          title: "",
          content: "",
          section: 0,
          order: 1,
          file: null,
          video_url: "",
          pdf_url: "",
          is_active: true,
        });
        setIsEditMode(false);
        setEditingId(null);
        fetchLessons();
      }
      // If there's an error, it will show in the modal
    }, 100);
  };

  const handleEditCourse = (course: any) => {
    setIsEditMode(true);
    setEditingId(course.id);
    setCourseFormData({
      title: course.title,
      description: course.description || "",
      course_type: course.course_type || "IELTS",
      branch: course.branch || undefined,
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

      setTimeout(() => {
        const currentError = useCoursesStore.getState().error;

        if (!currentError) {
          addToast("warning", "Course deleted successfully!");
        } else {
          addToast("error", currentError);
        }

        fetchCourses();
      }, 100);
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

      setTimeout(() => {
        const currentError = useSectionsStore.getState().error;

        if (!currentError) {
          addToast("warning", "Section deleted successfully!");
        } else {
          addToast("error", currentError);
        }

        fetchSections();
      }, 100);
    }
  };

  const handleAddLesson = (sectionId: number) => {
    setIsEditMode(false);
    setEditingId(null);
    setLessonFormData({
      title: "",
      content: "",
      section: sectionId,
      order: 1,
      file: null,
      video_url: "",
      pdf_url: "",
      is_active: true,
    });
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
      video_url: lesson.video_url || "",
      pdf_url: lesson.pdf_url || "",
      is_active: lesson.is_active ?? true,
    });
    setIsLessonModalOpen(true);
  };

  const handleDeleteLesson = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      await deleteLesson(id);

      setTimeout(() => {
        const currentError = useLessonsStore.getState().error;

        if (!currentError) {
          addToast("warning", "Lesson deleted successfully!");
        } else {
          addToast("error", currentError);
        }

        fetchLessons();
      }, 100);
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

  const closeVideoModal = () => {
    // Mark lesson as completed when closing video
    if (selectedLesson) {
      const { updateProgress } = useLessonProgressStore.getState();
      updateProgress(selectedLesson.id, true); // Mark as completed
    }
    setIsVideoModalOpen(false);
    setSelectedLesson(null);
  };

  const handleLessonIntroClick = (lesson: any) => {
    setSelectedLesson(lesson);
    setIsIntroModalOpen(true);
  };

  const closeIntroModal = () => {
    setIsIntroModalOpen(false);
    setSelectedLesson(null);
  };

  const handleStartVideo = async () => {
    if (selectedLesson) {
      const { updateProgress } = useLessonProgressStore.getState();
      await updateProgress(selectedLesson.id, false); // Mark as started (not completed yet)
    }
    setIsIntroModalOpen(false);
    setIsVideoModalOpen(true);
  };

  if (coursesLoading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-[#1a365d] border-r-[#2c5282] animate-spin"></div>
          </div>
          <p className="text-gray-700 font-semibold text-lg">
            Loading courses...
          </p>
          <p className="text-gray-500 text-sm mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  // Student View - Learning Interface
  if (isStudent) {
    // Filter courses - students see only enrolled courses
    const studentCourses = courses.filter((c) => {
      if (!c.is_active) return false;
      // Check if student is enrolled in this course
      const enrolledCourseIds =
        user?.enrolled_courses?.map((ec) => ec.id) || [];
      return enrolledCourseIds.includes(c.id);
    });

    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a365d] to-[#2c5282] rounded-lg shadow-md p-6 mb-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-7 h-7" />
            </div>
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
          {studentCourses.map((course) => {
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
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-200"
              >
                {/* Course Card Header */}
                <div className="bg-gradient-to-r from-[#1a365d] to-[#2c5282] p-6 text-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">
                        {course.course_type}
                      </span>
                      {course.branch_name && (
                        <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {course.branch_name}
                        </span>
                      )}
                    </div>
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
                                sectionLessons.map((lesson) => {
                                  const lessonProgress = progress[lesson.id];
                                  return (
                                    <div
                                      key={lesson.id}
                                      onClick={() =>
                                        handleLessonIntroClick(lesson)
                                      }
                                      className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded transition cursor-pointer group"
                                    >
                                      <PlayCircle className="w-4 h-4 text-[#1a365d] flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <span className="text-sm text-gray-700 block truncate">
                                          {lesson.title}
                                        </span>
                                        {lessonProgress &&
                                          lessonProgress.is_completed && (
                                            <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                                              <div
                                                className={`h-full transition-all ${
                                                  lessonProgress.is_completed
                                                    ? "bg-green-500"
                                                    : "bg-blue-500"
                                                }`}
                                                style={{
                                                  width: `${lessonProgress.is_completed ? 100 : 0}%`,
                                                }}
                                              />
                                            </div>
                                          )}
                                      </div>
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
                                      {lessonProgress?.is_completed && (
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                                          Done
                                        </span>
                                      )}
                                    </div>
                                  );
                                })
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
                  {(() => {
                    const courseSections = sections.filter(
                      (s) => s.course === course.id && s.is_active,
                    );
                    const courseLessons = courseSections.flatMap((section) =>
                      lessons.filter(
                        (l) => l.section === section.id && l.is_active,
                      ),
                    );
                    const completedLessons = courseLessons.filter(
                      (lesson) => progress[lesson.id]?.is_completed,
                    ).length;
                    const courseProgress =
                      courseLessons.length > 0
                        ? Math.round(
                            (completedLessons / courseLessons.length) * 100,
                          )
                        : 0;

                    return (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600 font-medium">
                            Progress: {completedLessons}/{courseLessons.length}
                          </span>
                          <span className="text-gray-700 font-semibold">
                            {courseProgress}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#1a365d] to-[#2c5282] transition-all duration-300"
                            style={{ width: `${courseProgress}%` }}
                          />
                        </div>
                        <button className="w-full bg-[#1a365d] text-white py-2 rounded-lg hover:bg-[#2c5282] transition font-medium text-sm">
                          {courseProgress === 100
                            ? "Course Completed! 🎉"
                            : courseProgress > 0
                              ? "Continue Learning"
                              : "Start Learning"}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>

        {studentCourses.length === 0 && !coursesLoading && (
          <div className="bg-white rounded-lg shadow-sm p-16 text-center border border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-600 text-xl font-semibold mb-2">
              No courses enrolled
            </p>
            <p className="text-gray-400 text-sm">
              Contact your admin to enroll in courses
            </p>
          </div>
        )}

        {/* Intro Modal */}
        {isIntroModalOpen && selectedLesson && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeIntroModal();
              }
            }}
          >
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#1a365d] to-[#2c5282] p-6 text-white flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedLesson.title}</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    Lesson {selectedLesson.order}
                  </p>
                </div>
                <button
                  onClick={closeIntroModal}
                  className="p-2 hover:bg-white/10 rounded-lg transition"
                  aria-label="Close intro"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Topic/Content */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Topic Overview
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-700 leading-relaxed">
                      {selectedLesson.content}
                    </p>
                  </div>
                </div>

                {/* Resources */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Resources
                  </h3>
                  <div className="space-y-2">
                    {selectedLesson.video_url && (
                      <button
                        onClick={() => {
                          window.open(selectedLesson.video_url, "_blank");
                        }}
                        className="w-full flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition cursor-pointer"
                      >
                        <PlayCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-800">
                            Video Lecture
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {selectedLesson.video_url}
                          </p>
                        </div>
                        <span className="text-xs text-blue-600 font-semibold whitespace-nowrap">
                          Open →
                        </span>
                      </button>
                    )}
                    {selectedLesson.pdf_url && (
                      <button
                        onClick={() => {
                          window.open(selectedLesson.pdf_url, "_blank");
                        }}
                        className="w-full flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition cursor-pointer"
                      >
                        <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-800">
                            PDF Materials
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {selectedLesson.pdf_url}
                          </p>
                        </div>
                        <span className="text-xs text-green-600 font-semibold whitespace-nowrap">
                          Open →
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleStartVideo}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#1a365d] text-white px-4 py-3 rounded-lg hover:bg-[#2c5282] transition font-semibold"
                  >
                    <PlayCircle className="w-5 h-5" />
                    Start Video
                  </button>
                  <button
                    onClick={closeIntroModal}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Video Player Modal */}
        {isVideoModalOpen && selectedLesson && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeVideoModal();
              }
            }}
          >
            <div className="w-full max-w-6xl">
              <div className="flex items-center justify-between mb-4">
                <div className="text-white">
                  <h2 className="text-xl font-bold">{selectedLesson.title}</h2>
                  <p className="text-sm text-gray-300">
                    Lesson {selectedLesson.order}
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

              {selectedLesson.file_url ? (
                <div className="bg-black rounded-lg overflow-hidden shadow-2xl">
                  <video
                    controls
                    className="w-full"
                    autoPlay
                    preload="metadata"
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
                  <button
                    onClick={closeVideoModal}
                    className="mt-4 px-6 py-2 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition"
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
  // Filter courses based on user role and branch
  const filteredCourses = courses.filter((c) => {
    // Superadmin sees all courses
    if (isSuperadmin) return true;

    // Admin and Teacher see only their branch courses
    if ((isAdmin || user?.role === "teacher") && user?.branch_id) {
      return c.branch === user.branch_id;
    }

    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a365d] to-[#2c5282] rounded-lg shadow-md p-6 mb-6 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Course Management
              </h1>
              <p className="text-blue-100 mt-1">
                Manage courses, sections, and lessons
                {user?.branch && ` - ${user.branch}`}
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
                branch: undefined,
                is_active: true,
              });
              clearCourseError();
              setIsCourseModalOpen(true);
            }}
            className="flex items-center gap-2 bg-white text-[#1a365d] px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-all font-semibold shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add Course
          </button>
        </div>
      </div>

      {/* Error Message */}
      {coursesError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl">⚠️</span>
            </div>
            <p className="text-red-700 font-semibold">{coursesError}</p>
          </div>
        </div>
      )}

      {/* Courses List */}
      <div className="space-y-4">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all duration-300"
          >
            {/* Course Header */}
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleCourse(course.id)}
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition"
                  >
                    {expandedCourses.has(course.id) ? (
                      <ChevronDown className="w-5 h-5 text-gray-700" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    )}
                  </button>
                  <div className="w-10 h-10 bg-gradient-to-br from-[#1a365d] to-[#2c5282] rounded-lg flex items-center justify-center shadow-sm">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
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
                      <span className="text-xs bg-blue-50 text-[#1a365d] px-2.5 py-1 rounded-full font-semibold">
                        {course.course_type}
                      </span>
                      {course.branch_name && (
                        <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {course.branch_name}
                        </span>
                      )}
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold ${course.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                      >
                        {course.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddSection(course.id)}
                    className="flex items-center gap-1 px-3 py-2 bg-[#2c5282] text-white text-sm rounded-lg hover:bg-[#1a365d] transition-all shadow-sm font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    Section
                  </button>
                  <button
                    onClick={() => handleEditCourse(course)}
                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
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
                                className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${section.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                              >
                                {section.is_active ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAddLesson(section.id)}
                              className="flex items-center gap-1 px-2 py-1 bg-[#c41e3a] text-white text-xs rounded hover:bg-[#a01629] transition"
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
                                className="bg-white p-3 rounded border border-gray-200 hover:border-[#1a365d] transition"
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
                                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                                            Video: .{lesson.file_type || "file"}
                                          </span>
                                        )}
                                        <span
                                          className={`text-xs px-2 py-0.5 rounded ${lesson.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
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

        {filteredCourses.length === 0 && !coursesLoading && (
          <div className="bg-white rounded-lg shadow-sm p-16 text-center border border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-600 text-xl font-semibold mb-2">
              No courses found
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Click "Add Course" to create your first course
            </p>
            <button
              onClick={() => {
                setIsEditMode(false);
                setEditingId(null);
                setCourseFormData({
                  title: "",
                  description: "",
                  course_type: "IELTS",
                  branch: undefined,
                  is_active: true,
                });
                clearCourseError();
                setIsCourseModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-all shadow-sm font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add First Course
            </button>
          </div>
        )}
      </div>

      {/* Course Modal */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {isSuperadmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={courseFormData.branch || ""}
                    onChange={(e) =>
                      setCourseFormData({
                        ...courseFormData,
                        branch: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    required={isSuperadmin}
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
                    Select which branch this course belongs to
                  </p>
                </div>
              )}

              {isAdmin && user?.branch_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch
                  </label>
                  <input
                    type="text"
                    value={user?.branch || "Your Branch"}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Courses will be created for your branch automatically
                  </p>
                </div>
              )}

              {coursesError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{coursesError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={coursesLoading}
                  className="flex-1 bg-[#1a365d] text-white px-4 py-2 rounded-lg hover:bg-[#2c5282] transition font-medium disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {sectionsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{sectionsError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={sectionsLoading}
                  className="flex-1 bg-[#2c5282] text-white px-4 py-2 rounded-lg hover:bg-[#1a365d] transition font-medium disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: MP4, AVI, MOV, WMV, FLV, MKV, WebM
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video URL (optional)
                </label>
                <input
                  type="url"
                  value={lessonFormData.video_url}
                  onChange={(e) =>
                    setLessonFormData({
                      ...lessonFormData,
                      video_url: e.target.value,
                    })
                  }
                  placeholder="https://example.com/video"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Direct link to video (YouTube, Vimeo, etc.)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PDF Link (optional)
                </label>
                <input
                  type="url"
                  value={lessonFormData.pdf_url}
                  onChange={(e) =>
                    setLessonFormData({
                      ...lessonFormData,
                      pdf_url: e.target.value,
                    })
                  }
                  placeholder="https://example.com/materials.pdf"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a365d] focus:border-[#1a365d]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Link to PDF materials or study guide
                </p>
              </div>

              {lessonsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{lessonsError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={lessonsLoading}
                  className="flex-1 bg-[#c41e3a] text-white px-4 py-2 rounded-lg hover:bg-[#a01629] transition font-medium disabled:opacity-50"
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

import { create } from "zustand";
import axios from "axios";
import { LessonApi } from "@/Endpoints/Classes/Lessions";

export interface LessonData {
  id: number;
  title: string;
  content: string;
  section: number;
  file?: string | null; // File path from backend
  file_url?: string | null; // Full URL from backend
  file_type?: string | null; // File extension (mp4, avi, etc.)
  video_url?: string | null; // Direct video URL
  pdf_url?: string | null; // PDF link
  order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
  deleted_at?: string | null;
}

// For form submission with file upload
export interface LessonFormData extends Omit<
  Partial<LessonData>,
  "file" | "file_url" | "file_type"
> {
  file?: File | string | null; // Can be File object for upload or string path from API
  video_url?: string; // Direct video URL
  pdf_url?: string; // PDF link
}

interface LessonsState {
  lessons: LessonData[];
  loading: boolean;
  error: string | null;
  currentLesson: LessonData | null;

  fetchLessons: () => Promise<void>;
  getLesson: (id: number | string) => Promise<void>;
  createLesson: (lessonData: LessonFormData) => Promise<void>;
  updateLesson: (
    id: number | string,
    lessonData: LessonFormData,
  ) => Promise<void>;
  patchLesson: (
    id: number | string,
    lessonData: LessonFormData,
  ) => Promise<void>;
  deleteLesson: (id: number | string) => Promise<void>;
  clearError: () => void;
}

export const useLessonsStore = create<LessonsState>()((set) => ({
  lessons: [],
  loading: false,
  error: null,
  currentLesson: null,

  fetchLessons: async () => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(LessonApi.fetchLessons, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let lessonsData = res.data.data || res.data.results || res.data;

      // Fix file URLs if they don't have /media/ prefix
      if (Array.isArray(lessonsData)) {
        lessonsData = lessonsData.map((lesson) => {
          if (
            lesson.file_url &&
            !lesson.file_url.includes("/media/") &&
            lesson.file
          ) {
            const baseUrl =
              import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
            const cleanBaseUrl = baseUrl.replace(/\/$/, "");
            const filePath = lesson.file.startsWith("/")
              ? lesson.file
              : `/${lesson.file}`;
            lesson.file_url = `${cleanBaseUrl}/media${filePath}`;
          }
          return lesson;
        });
      }

      set({
        lessons: Array.isArray(lessonsData) ? lessonsData : [],
        loading: false,
      });
    } catch (err: any) {
      console.error("Fetch Lessons Error:", err.response?.data);
      set({
        error: err.response?.data?.detail || "Failed to fetch lessons",
        loading: false,
        lessons: [],
      });
    }
  },

  getLesson: async (id: number | string) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(LessonApi.getLesson(id), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let lessonData = res.data.data || res.data;

      // Fix file URL if it doesn't have /media/ prefix
      if (
        lessonData.file_url &&
        !lessonData.file_url.includes("/media/") &&
        lessonData.file
      ) {
        const baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
        const cleanBaseUrl = baseUrl.replace(/\/$/, "");
        const filePath = lessonData.file.startsWith("/")
          ? lessonData.file
          : `/${lessonData.file}`;
        lessonData.file_url = `${cleanBaseUrl}/media${filePath}`;
      }

      set({ currentLesson: lessonData, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to fetch lesson",
        loading: false,
        currentLesson: null,
      });
    }
  },

  createLesson: async (lessonData: LessonFormData) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");

      // Check if we need to use FormData (for file uploads)
      const hasFile = lessonData.file && typeof lessonData.file !== "string";
      let requestData: any;
      let headers: any = {
        Authorization: `Bearer ${token}`,
      };

      if (hasFile) {
        // Use FormData for file upload
        const formData = new FormData();
        Object.keys(lessonData).forEach((key) => {
          const value = lessonData[key as keyof typeof lessonData];
          if (value !== null && value !== undefined) {
            formData.append(key, value as any);
          }
        });
        requestData = formData;
        headers["Content-Type"] = "multipart/form-data";
      } else {
        // For non-file creates, send clean JSON
        requestData = {};
        Object.keys(lessonData).forEach((key) => {
          const value = lessonData[key as keyof typeof lessonData];
          if (value !== null && value !== undefined) {
            requestData[key] = value;
          }
        });
      }

      const res = await axios.post(LessonApi.createLesson, requestData, {
        headers,
      });

      const newLesson = res.data.data || res.data;

      set((state) => ({
        lessons: [...state.lessons, newLesson],
        loading: false,
      }));
    } catch (err: any) {
      console.error("Create Lesson Error:", err.response?.data);
      set({
        error:
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to create lesson",
        loading: false,
      });
    }
  },

  updateLesson: async (id: number | string, lessonData: LessonFormData) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");

      // Check if we need to use FormData (for file uploads)
      const hasFile = lessonData.file && typeof lessonData.file !== "string";
      let requestData: any;
      let headers: any = {
        Authorization: `Bearer ${token}`,
      };

      if (hasFile) {
        // Use FormData for file upload
        const formData = new FormData();
        Object.keys(lessonData).forEach((key) => {
          const value = lessonData[key as keyof typeof lessonData];
          if (value !== null && value !== undefined) {
            formData.append(key, value as any);
          }
        });
        requestData = formData;
        headers["Content-Type"] = "multipart/form-data";
      } else {
        // For non-file updates, send clean JSON
        requestData = {};
        Object.keys(lessonData).forEach((key) => {
          const value = lessonData[key as keyof typeof lessonData];
          if (value !== null && value !== undefined) {
            requestData[key] = value;
          }
        });
      }

      const res = await axios.put(LessonApi.updateLesson(id), requestData, {
        headers,
      });

      const updatedLesson = res.data.data || res.data;

      set((state) => ({
        lessons: state.lessons.map((lesson) =>
          lesson.id === id ? updatedLesson : lesson,
        ),
        currentLesson:
          state.currentLesson?.id === id ? updatedLesson : state.currentLesson,
        loading: false,
      }));
    } catch (err: any) {
      console.error("Update Lesson Error:", err.response?.data);
      set({
        error: err.response?.data?.detail || "Failed to update lesson",
        loading: false,
      });
    }
  },

  patchLesson: async (id: number | string, lessonData: LessonFormData) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");

      // Check if we need to use FormData (for file uploads)
      const hasFile = lessonData.file && typeof lessonData.file !== "string";
      let requestData: any;
      let headers: any = {
        Authorization: `Bearer ${token}`,
      };

      if (hasFile) {
        // Use FormData for file upload
        const formData = new FormData();
        Object.keys(lessonData).forEach((key) => {
          const value = lessonData[key as keyof typeof lessonData];
          if (value !== null && value !== undefined) {
            formData.append(key, value as any);
          }
        });
        requestData = formData;
        headers["Content-Type"] = "multipart/form-data";
      } else {
        // For non-file updates, send clean JSON
        requestData = {};
        Object.keys(lessonData).forEach((key) => {
          const value = lessonData[key as keyof typeof lessonData];
          if (value !== null && value !== undefined) {
            requestData[key] = value;
          }
        });
      }

      const res = await axios.patch(LessonApi.patchLesson(id), requestData, {
        headers,
      });

      const updatedLesson = res.data.data || res.data;

      set((state) => ({
        lessons: state.lessons.map((lesson) =>
          lesson.id === id ? updatedLesson : lesson,
        ),
        currentLesson:
          state.currentLesson?.id === id ? updatedLesson : state.currentLesson,
        loading: false,
      }));
    } catch (err: any) {
      console.error("Patch Lesson Error:", err.response?.data);
      set({
        error: err.response?.data?.detail || "Failed to patch lesson",
        loading: false,
      });
    }
  },

  deleteLesson: async (id: number | string) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      await axios.delete(LessonApi.deleteLesson(id), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set((state) => ({
        lessons: state.lessons.filter((lesson) => lesson.id !== id),
        currentLesson:
          state.currentLesson?.id === id ? null : state.currentLesson,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error:
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to delete lesson",
        loading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

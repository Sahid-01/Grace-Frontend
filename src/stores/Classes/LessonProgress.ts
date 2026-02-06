import { create } from "zustand";
import axios from "axios";
import { LessonProgressApi } from "@/Endpoints/Classes/LessonProgress";

export interface LessonProgressData {
  id: number;
  lesson: number;
  lesson_title: string;
  progress_percentage: number;
  is_completed: boolean;
  last_accessed: string;
}

interface LessonProgressState {
  progress: Record<number, LessonProgressData>; // lesson_id -> progress
  loading: boolean;
  error: string | null;

  fetchProgress: () => Promise<void>;
  updateProgress: (
    lessonId: number,
    progressPercentage: number,
    isCompleted: boolean,
  ) => Promise<void>;
  getProgress: (lessonId: number) => LessonProgressData | null;
  clearError: () => void;
}

export const useLessonProgressStore = create<LessonProgressState>()(
  (set, get) => ({
    progress: {},
    loading: false,
    error: null,

    fetchProgress: async () => {
      set({ loading: true, error: null });

      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(LessonProgressApi.fetchProgress, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const progressData = res.data.data || res.data.results || res.data;
        const progressMap: Record<number, LessonProgressData> = {};

        if (Array.isArray(progressData)) {
          progressData.forEach((item) => {
            progressMap[item.lesson] = item;
          });
        }

        set({ progress: progressMap, loading: false });
      } catch (err: any) {
        console.error("Fetch Progress Error:", err.response?.data);
        set({
          error: err.response?.data?.detail || "Failed to fetch progress",
          loading: false,
        });
      }
    },

    updateProgress: async (
      lessonId: number,
      progressPercentage: number,
      isCompleted: boolean,
    ) => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.post(
          LessonProgressApi.updateProgressByLesson,
          {
            lesson_id: lessonId,
            progress_percentage: progressPercentage,
            is_completed: isCompleted,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const updatedProgress = res.data;

        set((state) => ({
          progress: {
            ...state.progress,
            [lessonId]: updatedProgress,
          },
        }));
      } catch (err: any) {
        console.error("Update Progress Error:", err.response?.data);
        set({
          error: err.response?.data?.detail || "Failed to update progress",
        });
      }
    },

    getProgress: (lessonId: number) => {
      const state = get();
      return state.progress[lessonId] || null;
    },

    clearError: () => {
      set({ error: null });
    },
  }),
);

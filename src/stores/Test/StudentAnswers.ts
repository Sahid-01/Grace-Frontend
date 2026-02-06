import { create } from "zustand";
import axios from "axios";
import { StudentAnswersApi } from "@/Endpoints/Test/StudentAnswers";

export interface StudentAnswerData {
  id: number;
  test_attempt_id: number;
  question_id: number;
  selected_option_id?: number;
  answer_text?: string;
  is_correct: boolean;
  created_at?: string;
  updated_at?: string;
}

interface StudentAnswersState {
  studentAnswers: StudentAnswerData[];
  loading: boolean;
  error: string | null;
  currentStudentAnswer: StudentAnswerData | null;

  fetchStudentAnswers: () => Promise<void>;
  getStudentAnswer: (id: number | string) => Promise<void>;
  createStudentAnswer: (data: Partial<StudentAnswerData>) => Promise<void>;
  updateStudentAnswer: (
    id: number | string,
    data: Partial<StudentAnswerData>,
  ) => Promise<void>;
  patchStudentAnswer: (
    id: number | string,
    data: Partial<StudentAnswerData>,
  ) => Promise<void>;
  deleteStudentAnswer: (id: number | string) => Promise<void>;
  clearError: () => void;
}

export const useStudentAnswersStore = create<StudentAnswersState>()((set) => ({
  studentAnswers: [],
  loading: false,
  error: null,
  currentStudentAnswer: null,

  fetchStudentAnswers: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(StudentAnswersApi.fetchStudentAnswers, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data || res.data.results || res.data;
      set({ studentAnswers: Array.isArray(data) ? data : [], loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to fetch student answers",
        loading: false,
        studentAnswers: [],
      });
    }
  },

  getStudentAnswer: async (id: number | string) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(StudentAnswersApi.getStudentAnswer(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data || res.data;
      set({ currentStudentAnswer: data, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to fetch student answer",
        loading: false,
        currentStudentAnswer: null,
      });
    }
  },

  createStudentAnswer: async (data: Partial<StudentAnswerData>) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        StudentAnswersApi.createStudentAnswer,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const newData = res.data.data || res.data;
      set((state) => ({
        studentAnswers: [...state.studentAnswers, newData],
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to create student answer",
        loading: false,
      });
    }
  },

  updateStudentAnswer: async (
    id: number | string,
    data: Partial<StudentAnswerData>,
  ) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        StudentAnswersApi.updateStudentAnswer(id),
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const updatedData = res.data.data || res.data;
      set((state) => ({
        studentAnswers: state.studentAnswers.map((item) =>
          item.id === id ? updatedData : item,
        ),
        currentStudentAnswer:
          state.currentStudentAnswer?.id === id
            ? updatedData
            : state.currentStudentAnswer,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to update student answer",
        loading: false,
      });
    }
  },

  patchStudentAnswer: async (
    id: number | string,
    data: Partial<StudentAnswerData>,
  ) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        StudentAnswersApi.patchStudentAnswer(id),
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const updatedData = res.data.data || res.data;
      set((state) => ({
        studentAnswers: state.studentAnswers.map((item) =>
          item.id === id ? updatedData : item,
        ),
        currentStudentAnswer:
          state.currentStudentAnswer?.id === id
            ? updatedData
            : state.currentStudentAnswer,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to patch student answer",
        loading: false,
      });
    }
  },

  deleteStudentAnswer: async (id: number | string) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      await axios.delete(StudentAnswersApi.deleteStudentAnswer(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        studentAnswers: state.studentAnswers.filter((item) => item.id !== id),
        currentStudentAnswer:
          state.currentStudentAnswer?.id === id
            ? null
            : state.currentStudentAnswer,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to delete student answer",
        loading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

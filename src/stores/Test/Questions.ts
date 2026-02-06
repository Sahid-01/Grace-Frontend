import { create } from "zustand";
import axios from "axios";
import { QuestionsApi } from "@/Endpoints/Test/Questions";

export interface QuestionData {
  id: number;
  test_section: number;
  question_text: string;
  question_audio?: string;
  question_type: "mcq" | "text" | "essay" | "audio";
  marks: number;
  order: number;
  correct_answer?: string;
  created_at?: string;
  updated_at?: string;
}

interface QuestionsState {
  questions: QuestionData[];
  loading: boolean;
  error: string | null;
  currentQuestion: QuestionData | null;

  fetchQuestions: () => Promise<void>;
  getQuestion: (id: number | string) => Promise<void>;
  createQuestion: (data: Partial<QuestionData>) => Promise<void>;
  updateQuestion: (
    id: number | string,
    data: Partial<QuestionData>,
  ) => Promise<void>;
  patchQuestion: (
    id: number | string,
    data: Partial<QuestionData>,
  ) => Promise<void>;
  deleteQuestion: (id: number | string) => Promise<void>;
  clearError: () => void;
}

export const useQuestionsStore = create<QuestionsState>()((set) => ({
  questions: [],
  loading: false,
  error: null,
  currentQuestion: null,

  fetchQuestions: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(QuestionsApi.fetchQuestions, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data || res.data.results || res.data;
      set({ questions: Array.isArray(data) ? data : [], loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to fetch questions",
        loading: false,
        questions: [],
      });
    }
  },

  getQuestion: async (id: number | string) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(QuestionsApi.getQuestion(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data || res.data;
      set({ currentQuestion: data, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to fetch question",
        loading: false,
        currentQuestion: null,
      });
    }
  },

  createQuestion: async (data: Partial<QuestionData>) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(QuestionsApi.createQuestion, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newData = res.data.data || res.data;
      set((state) => ({
        questions: [...state.questions, newData],
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to create question",
        loading: false,
      });
    }
  },

  updateQuestion: async (id: number | string, data: Partial<QuestionData>) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(QuestionsApi.updateQuestion(id), data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedData = res.data.data || res.data;
      set((state) => ({
        questions: state.questions.map((item) =>
          item.id === id ? updatedData : item,
        ),
        currentQuestion:
          state.currentQuestion?.id === id
            ? updatedData
            : state.currentQuestion,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to update question",
        loading: false,
      });
    }
  },

  patchQuestion: async (id: number | string, data: Partial<QuestionData>) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(QuestionsApi.patchQuestion(id), data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedData = res.data.data || res.data;
      set((state) => ({
        questions: state.questions.map((item) =>
          item.id === id ? updatedData : item,
        ),
        currentQuestion:
          state.currentQuestion?.id === id
            ? updatedData
            : state.currentQuestion,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to patch question",
        loading: false,
      });
    }
  },

  deleteQuestion: async (id: number | string) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      await axios.delete(QuestionsApi.deleteQuestion(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        questions: state.questions.filter((item) => item.id !== id),
        currentQuestion:
          state.currentQuestion?.id === id ? null : state.currentQuestion,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to delete question",
        loading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

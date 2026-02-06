import { create } from "zustand";
import axios from "axios";
import { QuestionOptionsApi } from "@/Endpoints/Test/QuestionOptions";

export interface QuestionOptionData {
  id: number;
  question: number;
  option_text: string;
  option_letter?: string;
  is_correct: boolean;
  created_at?: string;
  updated_at?: string;
}

interface QuestionOptionsState {
  questionOptions: QuestionOptionData[];
  loading: boolean;
  error: string | null;
  currentQuestionOption: QuestionOptionData | null;

  fetchQuestionOptions: () => Promise<void>;
  getQuestionOption: (id: number | string) => Promise<void>;
  createQuestionOption: (data: Partial<QuestionOptionData>) => Promise<void>;
  updateQuestionOption: (
    id: number | string,
    data: Partial<QuestionOptionData>,
  ) => Promise<void>;
  patchQuestionOption: (
    id: number | string,
    data: Partial<QuestionOptionData>,
  ) => Promise<void>;
  deleteQuestionOption: (id: number | string) => Promise<void>;
  clearError: () => void;
}

export const useQuestionOptionsStore = create<QuestionOptionsState>()(
  (set) => ({
    questionOptions: [],
    loading: false,
    error: null,
    currentQuestionOption: null,

    fetchQuestionOptions: async () => {
      set({ loading: true, error: null });
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(QuestionOptionsApi.fetchQuestionOptions, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data.data || res.data.results || res.data;
        set({
          questionOptions: Array.isArray(data) ? data : [],
          loading: false,
        });
      } catch (err: any) {
        set({
          error:
            err.response?.data?.detail || "Failed to fetch question options",
          loading: false,
          questionOptions: [],
        });
      }
    },

    getQuestionOption: async (id: number | string) => {
      set({ loading: true, error: null });
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(QuestionOptionsApi.getQuestionOption(id), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data.data || res.data;
        set({ currentQuestionOption: data, loading: false });
      } catch (err: any) {
        set({
          error:
            err.response?.data?.detail || "Failed to fetch question option",
          loading: false,
          currentQuestionOption: null,
        });
      }
    },

    createQuestionOption: async (data: Partial<QuestionOptionData>) => {
      set({ loading: true, error: null });
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          QuestionOptionsApi.createQuestionOption,
          data,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const newData = res.data.data || res.data;
        set((state) => ({
          questionOptions: [...state.questionOptions, newData],
          loading: false,
        }));
      } catch (err: any) {
        set({
          error:
            err.response?.data?.detail || "Failed to create question option",
          loading: false,
        });
      }
    },

    updateQuestionOption: async (
      id: number | string,
      data: Partial<QuestionOptionData>,
    ) => {
      set({ loading: true, error: null });
      try {
        const token = localStorage.getItem("token");
        const res = await axios.put(
          QuestionOptionsApi.updateQuestionOption(id),
          data,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const updatedData = res.data.data || res.data;
        set((state) => ({
          questionOptions: state.questionOptions.map((item) =>
            item.id === id ? updatedData : item,
          ),
          currentQuestionOption:
            state.currentQuestionOption?.id === id
              ? updatedData
              : state.currentQuestionOption,
          loading: false,
        }));
      } catch (err: any) {
        set({
          error:
            err.response?.data?.detail || "Failed to update question option",
          loading: false,
        });
      }
    },

    patchQuestionOption: async (
      id: number | string,
      data: Partial<QuestionOptionData>,
    ) => {
      set({ loading: true, error: null });
      try {
        const token = localStorage.getItem("token");
        const res = await axios.patch(
          QuestionOptionsApi.patchQuestionOption(id),
          data,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const updatedData = res.data.data || res.data;
        set((state) => ({
          questionOptions: state.questionOptions.map((item) =>
            item.id === id ? updatedData : item,
          ),
          currentQuestionOption:
            state.currentQuestionOption?.id === id
              ? updatedData
              : state.currentQuestionOption,
          loading: false,
        }));
      } catch (err: any) {
        set({
          error:
            err.response?.data?.detail || "Failed to patch question option",
          loading: false,
        });
      }
    },

    deleteQuestionOption: async (id: number | string) => {
      set({ loading: true, error: null });
      try {
        const token = localStorage.getItem("token");
        await axios.delete(QuestionOptionsApi.deleteQuestionOption(id), {
          headers: { Authorization: `Bearer ${token}` },
        });
        set((state) => ({
          questionOptions: state.questionOptions.filter(
            (item) => item.id !== id,
          ),
          currentQuestionOption:
            state.currentQuestionOption?.id === id
              ? null
              : state.currentQuestionOption,
          loading: false,
        }));
      } catch (err: any) {
        set({
          error:
            err.response?.data?.detail || "Failed to delete question option",
          loading: false,
        });
      }
    },

    clearError: () => {
      set({ error: null });
    },
  }),
);

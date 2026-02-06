import { create } from "zustand";
import axios from "axios";
import { ManualEvaluationsApi } from "@/Endpoints/Test/ManualEvaluations";

export interface ManualEvaluationData {
  id: number;
  student_answer_id: number;
  evaluator_id: number;
  score: number;
  feedback: string;
  created_at?: string;
  updated_at?: string;
}

interface ManualEvaluationsState {
  manualEvaluations: ManualEvaluationData[];
  loading: boolean;
  error: string | null;
  currentManualEvaluation: ManualEvaluationData | null;

  fetchManualEvaluations: () => Promise<void>;
  getManualEvaluation: (id: number | string) => Promise<void>;
  createManualEvaluation: (
    data: Partial<ManualEvaluationData>,
  ) => Promise<void>;
  updateManualEvaluation: (
    id: number | string,
    data: Partial<ManualEvaluationData>,
  ) => Promise<void>;
  patchManualEvaluation: (
    id: number | string,
    data: Partial<ManualEvaluationData>,
  ) => Promise<void>;
  deleteManualEvaluation: (id: number | string) => Promise<void>;
  clearError: () => void;
}

export const useManualEvaluationsStore = create<ManualEvaluationsState>()(
  (set) => ({
    manualEvaluations: [],
    loading: false,
    error: null,
    currentManualEvaluation: null,

    fetchManualEvaluations: async () => {
      set({ loading: true, error: null });
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          ManualEvaluationsApi.fetchManualEvaluations,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = res.data.data || res.data.results || res.data;
        set({
          manualEvaluations: Array.isArray(data) ? data : [],
          loading: false,
        });
      } catch (err: any) {
        set({
          error:
            err.response?.data?.detail || "Failed to fetch manual evaluations",
          loading: false,
          manualEvaluations: [],
        });
      }
    },

    getManualEvaluation: async (id: number | string) => {
      set({ loading: true, error: null });
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          ManualEvaluationsApi.getManualEvaluation(id),
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = res.data.data || res.data;
        set({ currentManualEvaluation: data, loading: false });
      } catch (err: any) {
        set({
          error:
            err.response?.data?.detail || "Failed to fetch manual evaluation",
          loading: false,
          currentManualEvaluation: null,
        });
      }
    },

    createManualEvaluation: async (data: Partial<ManualEvaluationData>) => {
      set({ loading: true, error: null });
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          ManualEvaluationsApi.createManualEvaluation,
          data,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const newData = res.data.data || res.data;
        set((state) => ({
          manualEvaluations: [...state.manualEvaluations, newData],
          loading: false,
        }));
      } catch (err: any) {
        set({
          error:
            err.response?.data?.detail || "Failed to create manual evaluation",
          loading: false,
        });
      }
    },

    updateManualEvaluation: async (
      id: number | string,
      data: Partial<ManualEvaluationData>,
    ) => {
      set({ loading: true, error: null });
      try {
        const token = localStorage.getItem("token");
        const res = await axios.put(
          ManualEvaluationsApi.updateManualEvaluation(id),
          data,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const updatedData = res.data.data || res.data;
        set((state) => ({
          manualEvaluations: state.manualEvaluations.map((item) =>
            item.id === id ? updatedData : item,
          ),
          currentManualEvaluation:
            state.currentManualEvaluation?.id === id
              ? updatedData
              : state.currentManualEvaluation,
          loading: false,
        }));
      } catch (err: any) {
        set({
          error:
            err.response?.data?.detail || "Failed to update manual evaluation",
          loading: false,
        });
      }
    },

    patchManualEvaluation: async (
      id: number | string,
      data: Partial<ManualEvaluationData>,
    ) => {
      set({ loading: true, error: null });
      try {
        const token = localStorage.getItem("token");
        const res = await axios.patch(
          ManualEvaluationsApi.patchManualEvaluation(id),
          data,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const updatedData = res.data.data || res.data;
        set((state) => ({
          manualEvaluations: state.manualEvaluations.map((item) =>
            item.id === id ? updatedData : item,
          ),
          currentManualEvaluation:
            state.currentManualEvaluation?.id === id
              ? updatedData
              : state.currentManualEvaluation,
          loading: false,
        }));
      } catch (err: any) {
        set({
          error:
            err.response?.data?.detail || "Failed to patch manual evaluation",
          loading: false,
        });
      }
    },

    deleteManualEvaluation: async (id: number | string) => {
      set({ loading: true, error: null });
      try {
        const token = localStorage.getItem("token");
        await axios.delete(ManualEvaluationsApi.deleteManualEvaluation(id), {
          headers: { Authorization: `Bearer ${token}` },
        });
        set((state) => ({
          manualEvaluations: state.manualEvaluations.filter(
            (item) => item.id !== id,
          ),
          currentManualEvaluation:
            state.currentManualEvaluation?.id === id
              ? null
              : state.currentManualEvaluation,
          loading: false,
        }));
      } catch (err: any) {
        set({
          error:
            err.response?.data?.detail || "Failed to delete manual evaluation",
          loading: false,
        });
      }
    },

    clearError: () => {
      set({ error: null });
    },
  }),
);

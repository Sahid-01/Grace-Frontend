import { create } from "zustand";
import axios from "axios";
import { SectionResultsApi } from "@/Endpoints/Test/SectionResults";

export interface SectionResultData {
  id: number;
  test_result_id: number;
  test_section_id: number;
  obtained_score: number;
  total_score: number;
  created_at?: string;
  updated_at?: string;
}

interface SectionResultsState {
  sectionResults: SectionResultData[];
  loading: boolean;
  error: string | null;
  currentSectionResult: SectionResultData | null;

  fetchSectionResults: () => Promise<void>;
  getSectionResult: (id: number | string) => Promise<void>;
  createSectionResult: (data: Partial<SectionResultData>) => Promise<void>;
  updateSectionResult: (
    id: number | string,
    data: Partial<SectionResultData>,
  ) => Promise<void>;
  patchSectionResult: (
    id: number | string,
    data: Partial<SectionResultData>,
  ) => Promise<void>;
  deleteSectionResult: (id: number | string) => Promise<void>;
  clearError: () => void;
}

export const useSectionResultsStore = create<SectionResultsState>()((set) => ({
  sectionResults: [],
  loading: false,
  error: null,
  currentSectionResult: null,

  fetchSectionResults: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(SectionResultsApi.fetchSectionResults, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data || res.data.results || res.data;
      set({ sectionResults: Array.isArray(data) ? data : [], loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to fetch section results",
        loading: false,
        sectionResults: [],
      });
    }
  },

  getSectionResult: async (id: number | string) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(SectionResultsApi.getSectionResult(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data || res.data;
      set({ currentSectionResult: data, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to fetch section result",
        loading: false,
        currentSectionResult: null,
      });
    }
  },

  createSectionResult: async (data: Partial<SectionResultData>) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        SectionResultsApi.createSectionResult,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const newData = res.data.data || res.data;
      set((state) => ({
        sectionResults: [...state.sectionResults, newData],
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to create section result",
        loading: false,
      });
    }
  },

  updateSectionResult: async (
    id: number | string,
    data: Partial<SectionResultData>,
  ) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        SectionResultsApi.updateSectionResult(id),
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const updatedData = res.data.data || res.data;
      set((state) => ({
        sectionResults: state.sectionResults.map((item) =>
          item.id === id ? updatedData : item,
        ),
        currentSectionResult:
          state.currentSectionResult?.id === id
            ? updatedData
            : state.currentSectionResult,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to update section result",
        loading: false,
      });
    }
  },

  patchSectionResult: async (
    id: number | string,
    data: Partial<SectionResultData>,
  ) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        SectionResultsApi.patchSectionResult(id),
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const updatedData = res.data.data || res.data;
      set((state) => ({
        sectionResults: state.sectionResults.map((item) =>
          item.id === id ? updatedData : item,
        ),
        currentSectionResult:
          state.currentSectionResult?.id === id
            ? updatedData
            : state.currentSectionResult,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to patch section result",
        loading: false,
      });
    }
  },

  deleteSectionResult: async (id: number | string) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      await axios.delete(SectionResultsApi.deleteSectionResult(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        sectionResults: state.sectionResults.filter((item) => item.id !== id),
        currentSectionResult:
          state.currentSectionResult?.id === id
            ? null
            : state.currentSectionResult,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to delete section result",
        loading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

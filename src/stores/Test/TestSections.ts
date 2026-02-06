import { create } from "zustand";
import axios from "axios";
import { TestSectionsApi } from "@/Endpoints/Test/TestSections";

export interface TestSectionData {
  id: number;
  test: number;
  section: number;
  total_marks: number;
  duration_minutes: number;
  test_title?: string;
  section_name?: string;
  created_at?: string;
  updated_at?: string;
}

interface TestSectionsState {
  testSections: TestSectionData[];
  loading: boolean;
  error: string | null;
  currentTestSection: TestSectionData | null;

  fetchTestSections: () => Promise<void>;
  getTestSection: (id: number | string) => Promise<void>;
  createTestSection: (data: Partial<TestSectionData>) => Promise<void>;
  updateTestSection: (
    id: number | string,
    data: Partial<TestSectionData>,
  ) => Promise<void>;
  patchTestSection: (
    id: number | string,
    data: Partial<TestSectionData>,
  ) => Promise<void>;
  deleteTestSection: (id: number | string) => Promise<void>;
  clearError: () => void;
}

export const useTestSectionsStore = create<TestSectionsState>()((set) => ({
  testSections: [],
  loading: false,
  error: null,
  currentTestSection: null,

  fetchTestSections: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(TestSectionsApi.fetchTestSections, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data || res.data.results || res.data;
      set({ testSections: Array.isArray(data) ? data : [], loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to fetch test sections",
        loading: false,
        testSections: [],
      });
    }
  },

  getTestSection: async (id: number | string) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(TestSectionsApi.getTestSection(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data || res.data;
      set({ currentTestSection: data, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to fetch test section",
        loading: false,
        currentTestSection: null,
      });
    }
  },

  createTestSection: async (data: Partial<TestSectionData>) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(TestSectionsApi.createTestSection, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newData = res.data.data || res.data;
      set((state) => ({
        testSections: [...state.testSections, newData],
        loading: false,
      }));
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.response?.data?.non_field_errors?.[0] ||
        Object.values(err.response?.data || {}).flat()[0] ||
        "Failed to create test section";
      set({
        error: String(errorMsg),
        loading: false,
      });
    }
  },

  updateTestSection: async (
    id: number | string,
    data: Partial<TestSectionData>,
  ) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(TestSectionsApi.updateTestSection(id), data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedData = res.data.data || res.data;
      set((state) => ({
        testSections: state.testSections.map((item) =>
          item.id === id ? updatedData : item,
        ),
        currentTestSection:
          state.currentTestSection?.id === id
            ? updatedData
            : state.currentTestSection,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to update test section",
        loading: false,
      });
    }
  },

  patchTestSection: async (
    id: number | string,
    data: Partial<TestSectionData>,
  ) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        TestSectionsApi.patchTestSection(id),
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const updatedData = res.data.data || res.data;
      set((state) => ({
        testSections: state.testSections.map((item) =>
          item.id === id ? updatedData : item,
        ),
        currentTestSection:
          state.currentTestSection?.id === id
            ? updatedData
            : state.currentTestSection,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to patch test section",
        loading: false,
      });
    }
  },

  deleteTestSection: async (id: number | string) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      await axios.delete(TestSectionsApi.deleteTestSection(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        testSections: state.testSections.filter((item) => item.id !== id),
        currentTestSection:
          state.currentTestSection?.id === id ? null : state.currentTestSection,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to delete test section",
        loading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

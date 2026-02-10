import { create } from "zustand";
import axios from "axios";
import { TestsApi } from "@/Endpoints/Test/Tests";

export interface TestData {
  id: number;
  course: number;
  title: string;
  description: string;
  test_kind: "mock" | "practice" | "sectional";
  total_marks: number;
  duration_minutes: number;
  is_active: boolean;
  course_title?: string;
  created_at?: string;
  updated_at?: string;
}

interface TestsState {
  tests: TestData[];
  loading: boolean;
  error: string | null;
  currentTest: TestData | null;

  fetchTests: () => Promise<void>;
  getTest: (id: number | string) => Promise<void>;
  createTest: (data: Partial<TestData>) => Promise<void>;
  updateTest: (id: number | string, data: Partial<TestData>) => Promise<void>;
  patchTest: (id: number | string, data: Partial<TestData>) => Promise<void>;
  deleteTest: (id: number | string) => Promise<void>;
  clearError: () => void;
}

export const useTestsStore = create<TestsState>()((set) => ({
  tests: [],
  loading: false,
  error: null,
  currentTest: null,

  fetchTests: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(TestsApi.fetchTests, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data || res.data.results || res.data;
      set({ tests: Array.isArray(data) ? data : [], loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to fetch tests",
        loading: false,
        tests: [],
      });
    }
  },

  getTest: async (id: number | string) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(TestsApi.getTest(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data || res.data;
      set({ currentTest: data, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to fetch test",
        loading: false,
        currentTest: null,
      });
    }
  },

  createTest: async (data: Partial<TestData>) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(TestsApi.createTest, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newData = res.data.data || res.data;
      set((state) => ({
        tests: [...state.tests, newData],
        loading: false,
        error: null,
      }));
    } catch (err: any) {
      console.error("Create Test Error - Full Response:", err.response);
      console.error("Create Test Error - Data:", err.response?.data);
      const errorMessage =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        JSON.stringify(err.response?.data) ||
        err.message ||
        "Failed to create test";
      set({
        error: errorMessage,
        loading: false,
      });
    }
  },

  updateTest: async (id: number | string, data: Partial<TestData>) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(TestsApi.updateTest(id), data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedData = res.data.data || res.data;
      set((state) => ({
        tests: state.tests.map((item) => (item.id === id ? updatedData : item)),
        currentTest:
          state.currentTest?.id === id ? updatedData : state.currentTest,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to update test",
        loading: false,
      });
    }
  },

  patchTest: async (id: number | string, data: Partial<TestData>) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(TestsApi.patchTest(id), data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedData = res.data.data || res.data;
      set((state) => ({
        tests: state.tests.map((item) => (item.id === id ? updatedData : item)),
        currentTest:
          state.currentTest?.id === id ? updatedData : state.currentTest,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to patch test",
        loading: false,
      });
    }
  },

  deleteTest: async (id: number | string) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      await axios.delete(TestsApi.deleteTest(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        tests: state.tests.filter((item) => item.id !== id),
        currentTest: state.currentTest?.id === id ? null : state.currentTest,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to delete test",
        loading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

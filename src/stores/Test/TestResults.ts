import { create } from "zustand";
import axios from "axios";
import { TestResultsApi } from "@/Endpoints/Test/TestResults";

export interface TestResultData {
  id: number;
  test_attempt_id: number;
  total_score: number;
  obtained_score: number;
  percentage: number;
  band_score?: number;
  status: "pending" | "published";
  created_at?: string;
  updated_at?: string;
}

interface TestResultsState {
  testResults: TestResultData[];
  loading: boolean;
  error: string | null;
  currentTestResult: TestResultData | null;

  fetchTestResults: () => Promise<void>;
  getTestResult: (id: number | string) => Promise<void>;
  createTestResult: (data: Partial<TestResultData>) => Promise<void>;
  updateTestResult: (
    id: number | string,
    data: Partial<TestResultData>,
  ) => Promise<void>;
  patchTestResult: (
    id: number | string,
    data: Partial<TestResultData>,
  ) => Promise<void>;
  deleteTestResult: (id: number | string) => Promise<void>;
  clearError: () => void;
}

export const useTestResultsStore = create<TestResultsState>()((set) => ({
  testResults: [],
  loading: false,
  error: null,
  currentTestResult: null,

  fetchTestResults: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(TestResultsApi.fetchTestResults, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data || res.data.results || res.data;
      set({ testResults: Array.isArray(data) ? data : [], loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to fetch test results",
        loading: false,
        testResults: [],
      });
    }
  },

  getTestResult: async (id: number | string) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(TestResultsApi.getTestResult(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data || res.data;
      set({ currentTestResult: data, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to fetch test result",
        loading: false,
        currentTestResult: null,
      });
    }
  },

  createTestResult: async (data: Partial<TestResultData>) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(TestResultsApi.createTestResult, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newData = res.data.data || res.data;
      set((state) => ({
        testResults: [...state.testResults, newData],
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to create test result",
        loading: false,
      });
    }
  },

  updateTestResult: async (
    id: number | string,
    data: Partial<TestResultData>,
  ) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(TestResultsApi.updateTestResult(id), data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedData = res.data.data || res.data;
      set((state) => ({
        testResults: state.testResults.map((item) =>
          item.id === id ? updatedData : item,
        ),
        currentTestResult:
          state.currentTestResult?.id === id
            ? updatedData
            : state.currentTestResult,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to update test result",
        loading: false,
      });
    }
  },

  patchTestResult: async (
    id: number | string,
    data: Partial<TestResultData>,
  ) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(TestResultsApi.patchTestResult(id), data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedData = res.data.data || res.data;
      set((state) => ({
        testResults: state.testResults.map((item) =>
          item.id === id ? updatedData : item,
        ),
        currentTestResult:
          state.currentTestResult?.id === id
            ? updatedData
            : state.currentTestResult,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to patch test result",
        loading: false,
      });
    }
  },

  deleteTestResult: async (id: number | string) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      await axios.delete(TestResultsApi.deleteTestResult(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        testResults: state.testResults.filter((item) => item.id !== id),
        currentTestResult:
          state.currentTestResult?.id === id ? null : state.currentTestResult,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to delete test result",
        loading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

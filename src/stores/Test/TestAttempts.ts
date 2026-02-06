import { create } from "zustand";
import axios from "axios";
import { TestAttemptsApi } from "@/Endpoints/Test/TestAttempts";

export interface TestAttemptData {
  id: number;
  student: number;
  test: number;
  started_at: string;
  completed_at?: string;
  is_completed: boolean;
  student_username?: string;
  test_title?: string;
  created_at?: string;
  updated_at?: string;
}

interface TestAttemptsState {
  testAttempts: TestAttemptData[];
  loading: boolean;
  error: string | null;
  currentTestAttempt: TestAttemptData | null;

  fetchTestAttempts: () => Promise<void>;
  getTestAttempt: (id: number | string) => Promise<void>;
  createTestAttempt: (data: Partial<TestAttemptData>) => Promise<void>;
  updateTestAttempt: (
    id: number | string,
    data: Partial<TestAttemptData>,
  ) => Promise<void>;
  patchTestAttempt: (
    id: number | string,
    data: Partial<TestAttemptData>,
  ) => Promise<void>;
  deleteTestAttempt: (id: number | string) => Promise<void>;
  clearError: () => void;
}

export const useTestAttemptsStore = create<TestAttemptsState>()((set) => ({
  testAttempts: [],
  loading: false,
  error: null,
  currentTestAttempt: null,

  fetchTestAttempts: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(TestAttemptsApi.fetchTestAttempts, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data || res.data.results || res.data;
      set({ testAttempts: Array.isArray(data) ? data : [], loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to fetch test attempts",
        loading: false,
        testAttempts: [],
      });
    }
  },

  getTestAttempt: async (id: number | string) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(TestAttemptsApi.getTestAttempt(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data || res.data;
      set({ currentTestAttempt: data, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to fetch test attempt",
        loading: false,
        currentTestAttempt: null,
      });
    }
  },

  createTestAttempt: async (data: Partial<TestAttemptData>) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(TestAttemptsApi.createTestAttempt, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newData = res.data.data || res.data;
      set((state) => ({
        testAttempts: [...state.testAttempts, newData],
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to create test attempt",
        loading: false,
      });
    }
  },

  updateTestAttempt: async (
    id: number | string,
    data: Partial<TestAttemptData>,
  ) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(TestAttemptsApi.updateTestAttempt(id), data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedData = res.data.data || res.data;
      set((state) => ({
        testAttempts: state.testAttempts.map((item) =>
          item.id === id ? updatedData : item,
        ),
        currentTestAttempt:
          state.currentTestAttempt?.id === id
            ? updatedData
            : state.currentTestAttempt,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to update test attempt",
        loading: false,
      });
    }
  },

  patchTestAttempt: async (
    id: number | string,
    data: Partial<TestAttemptData>,
  ) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        TestAttemptsApi.patchTestAttempt(id),
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const updatedData = res.data.data || res.data;
      set((state) => ({
        testAttempts: state.testAttempts.map((item) =>
          item.id === id ? updatedData : item,
        ),
        currentTestAttempt:
          state.currentTestAttempt?.id === id
            ? updatedData
            : state.currentTestAttempt,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to patch test attempt",
        loading: false,
      });
    }
  },

  deleteTestAttempt: async (id: number | string) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem("token");
      await axios.delete(TestAttemptsApi.deleteTestAttempt(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      set((state) => ({
        testAttempts: state.testAttempts.filter((item) => item.id !== id),
        currentTestAttempt:
          state.currentTestAttempt?.id === id ? null : state.currentTestAttempt,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to delete test attempt",
        loading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

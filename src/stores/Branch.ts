import { create } from "zustand";
import axios from "axios";
import { BranchApi } from "@/Endpoints/Branch";

export interface BranchData {
  id: number;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface BranchState {
  branches: BranchData[];
  loading: boolean;
  error: string | null;
  currentBranch: BranchData | null;

  fetchBranches: () => Promise<void>;
  getBranch: (id: number | string) => Promise<void>;
  createBranch: (branchData: Partial<BranchData>) => Promise<void>;
  updateBranch: (
    id: number | string,
    branchData: Partial<BranchData>,
  ) => Promise<void>;
  patchBranch: (
    id: number | string,
    branchData: Partial<BranchData>,
  ) => Promise<void>;
  deleteBranch: (id: number | string) => Promise<void>;
  clearError: () => void;
}

export const useBranchStore = create<BranchState>()((set) => ({
  branches: [],
  loading: false,
  error: null,
  currentBranch: null,

  fetchBranches: async () => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(BranchApi.fetchBranches, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const branchesData = res.data.data || res.data.results || res.data;

      set({
        branches: Array.isArray(branchesData) ? branchesData : [],
        loading: false,
      });
    } catch (err: any) {
      console.error("Fetch Branches Error:", err.response?.data);
      set({
        error: err.response?.data?.detail || "Failed to fetch branches",
        loading: false,
        branches: [],
      });
    }
  },

  getBranch: async (id: number | string) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(BranchApi.getBranch(id), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const branchData = res.data.data || res.data;
      set({ currentBranch: branchData, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to fetch branch",
        loading: false,
        currentBranch: null,
      });
    }
  },

  createBranch: async (branchData: Partial<BranchData>) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(BranchApi.createBranch, branchData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const newBranch = res.data.data || res.data;

      set((state) => ({
        branches: [...state.branches, newBranch],
        loading: false,
      }));
    } catch (err: any) {
      set({
        error:
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to create branch",
        loading: false,
      });
    }
  },

  updateBranch: async (
    id: number | string,
    branchData: Partial<BranchData>,
  ) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(BranchApi.updateBranch(id), branchData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedBranch = res.data.data || res.data;

      set((state) => ({
        branches: state.branches.map((branch) =>
          branch.id === id ? updatedBranch : branch,
        ),
        currentBranch:
          state.currentBranch?.id === id ? updatedBranch : state.currentBranch,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to update branch",
        loading: false,
      });
    }
  },

  patchBranch: async (id: number | string, branchData: Partial<BranchData>) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(BranchApi.patchBranch(id), branchData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedBranch = res.data.data || res.data;

      set((state) => ({
        branches: state.branches.map((branch) =>
          branch.id === id ? updatedBranch : branch,
        ),
        currentBranch:
          state.currentBranch?.id === id ? updatedBranch : state.currentBranch,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to patch branch",
        loading: false,
      });
    }
  },

  deleteBranch: async (id: number | string) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      await axios.delete(BranchApi.deleteBranch(id), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set((state) => ({
        branches: state.branches.filter((branch) => branch.id !== id),
        currentBranch:
          state.currentBranch?.id === id ? null : state.currentBranch,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error:
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to delete branch",
        loading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

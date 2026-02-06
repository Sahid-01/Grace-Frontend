import { create } from "zustand";
import axios from "axios";
import { Bandscore } from "@/Endpoints/Test/Band-score-mappings";

export interface BandScoreMappingData {
  id: number;
  test_type: string;
  section: string;
  min_score: number;
  max_score: number;
  band_score: number;
  created_at?: string;
  updated_at?: string;
}

interface BandScoreMappingsState {
  bandScoreMappings: BandScoreMappingData[];
  loading: boolean;
  error: string | null;
  currentBandScoreMapping: BandScoreMappingData | null;

  fetchBandScoreMappings: () => Promise<void>;
  getBandScoreMapping: (id: number | string) => Promise<void>;
  createBandScoreMapping: (
    data: Partial<BandScoreMappingData>,
  ) => Promise<void>;
  updateBandScoreMapping: (
    id: number | string,
    data: Partial<BandScoreMappingData>,
  ) => Promise<void>;
  patchBandScoreMapping: (
    id: number | string,
    data: Partial<BandScoreMappingData>,
  ) => Promise<void>;
  deleteBandScoreMapping: (id: number | string) => Promise<void>;
  clearError: () => void;
}

export const useBandScoreMappingsStore = create<BandScoreMappingsState>()(
  (set) => ({
    bandScoreMappings: [],
    loading: false,
    error: null,
    currentBandScoreMapping: null,

    fetchBandScoreMappings: async () => {
      set({ loading: true, error: null });
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(Bandscore.fetchBandScoreMappings, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data.data || res.data.results || res.data;
        set({
          bandScoreMappings: Array.isArray(data) ? data : [],
          loading: false,
        });
      } catch (err: any) {
        set({
          error:
            err.response?.data?.detail || "Failed to fetch band score mappings",
          loading: false,
          bandScoreMappings: [],
        });
      }
    },

    getBandScoreMapping: async (id: number | string) => {
      set({ loading: true, error: null });
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(Bandscore.getBandScoreMapping(id), {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data.data || res.data;
        set({ currentBandScoreMapping: data, loading: false });
      } catch (err: any) {
        set({
          error:
            err.response?.data?.detail || "Failed to fetch band score mapping",
          loading: false,
          currentBandScoreMapping: null,
        });
      }
    },

    createBandScoreMapping: async (data: Partial<BandScoreMappingData>) => {
      set({ loading: true, error: null });
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(Bandscore.createBandScoreMapping, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const newData = res.data.data || res.data;
        set((state) => ({
          bandScoreMappings: [...state.bandScoreMappings, newData],
          loading: false,
        }));
      } catch (err: any) {
        set({
          error:
            err.response?.data?.detail || "Failed to create band score mapping",
          loading: false,
        });
      }
    },

    updateBandScoreMapping: async (
      id: number | string,
      data: Partial<BandScoreMappingData>,
    ) => {
      set({ loading: true, error: null });
      try {
        const token = localStorage.getItem("token");
        const res = await axios.put(
          Bandscore.updateBandScoreMapping(id),
          data,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const updatedData = res.data.data || res.data;
        set((state) => ({
          bandScoreMappings: state.bandScoreMappings.map((item) =>
            item.id === id ? updatedData : item,
          ),
          currentBandScoreMapping:
            state.currentBandScoreMapping?.id === id
              ? updatedData
              : state.currentBandScoreMapping,
          loading: false,
        }));
      } catch (err: any) {
        set({
          error:
            err.response?.data?.detail || "Failed to update band score mapping",
          loading: false,
        });
      }
    },

    patchBandScoreMapping: async (
      id: number | string,
      data: Partial<BandScoreMappingData>,
    ) => {
      set({ loading: true, error: null });
      try {
        const token = localStorage.getItem("token");
        const res = await axios.patch(
          Bandscore.patchBandScoreMapping(id),
          data,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const updatedData = res.data.data || res.data;
        set((state) => ({
          bandScoreMappings: state.bandScoreMappings.map((item) =>
            item.id === id ? updatedData : item,
          ),
          currentBandScoreMapping:
            state.currentBandScoreMapping?.id === id
              ? updatedData
              : state.currentBandScoreMapping,
          loading: false,
        }));
      } catch (err: any) {
        set({
          error:
            err.response?.data?.detail || "Failed to patch band score mapping",
          loading: false,
        });
      }
    },

    deleteBandScoreMapping: async (id: number | string) => {
      set({ loading: true, error: null });
      try {
        const token = localStorage.getItem("token");
        await axios.delete(Bandscore.deleteBandScoreMapping(id), {
          headers: { Authorization: `Bearer ${token}` },
        });
        set((state) => ({
          bandScoreMappings: state.bandScoreMappings.filter(
            (item) => item.id !== id,
          ),
          currentBandScoreMapping:
            state.currentBandScoreMapping?.id === id
              ? null
              : state.currentBandScoreMapping,
          loading: false,
        }));
      } catch (err: any) {
        set({
          error:
            err.response?.data?.detail || "Failed to delete band score mapping",
          loading: false,
        });
      }
    },

    clearError: () => {
      set({ error: null });
    },
  }),
);

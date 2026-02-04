import { create } from "zustand";
import axios from "axios";
import { SectionApi } from "@/Endpoints/sections";

export interface SectionData {
  id: number;
  name: "listening" | "reading" | "writing" | "speaking";
  course: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
  deleted_at?: string | null;
}

interface SectionsState {
  sections: SectionData[];
  loading: boolean;
  error: string | null;
  currentSection: SectionData | null;

  fetchSections: () => Promise<void>;
  getSection: (id: number | string) => Promise<void>;
  createSection: (sectionData: Partial<SectionData>) => Promise<void>;
  updateSection: (
    id: number | string,
    sectionData: Partial<SectionData>,
  ) => Promise<void>;
  patchSection: (
    id: number | string,
    sectionData: Partial<SectionData>,
  ) => Promise<void>;
  deleteSection: (id: number | string) => Promise<void>;
  clearError: () => void;
}

export const useSectionsStore = create<SectionsState>()((set) => ({
  sections: [],
  loading: false,
  error: null,
  currentSection: null,

  fetchSections: async () => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(SectionApi.fetchSections, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const sectionsData = res.data.data || res.data.results || res.data;

      set({
        sections: Array.isArray(sectionsData) ? sectionsData : [],
        loading: false,
      });
    } catch (err: any) {
      console.error("Fetch Sections Error:", err.response?.data);
      set({
        error: err.response?.data?.detail || "Failed to fetch sections",
        loading: false,
        sections: [],
      });
    }
  },

  getSection: async (id: number | string) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(SectionApi.getSection(id), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const sectionData = res.data.data || res.data;
      set({ currentSection: sectionData, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to fetch section",
        loading: false,
        currentSection: null,
      });
    }
  },

  createSection: async (sectionData: Partial<SectionData>) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(SectionApi.createSection, sectionData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const newSection = res.data.data || res.data;

      set((state) => ({
        sections: [...state.sections, newSection],
        loading: false,
      }));
    } catch (err: any) {
      set({
        error:
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to create section",
        loading: false,
      });
    }
  },

  updateSection: async (
    id: number | string,
    sectionData: Partial<SectionData>,
  ) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(SectionApi.updateSection(id), sectionData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedSection = res.data.data || res.data;

      set((state) => ({
        sections: state.sections.map((section) =>
          section.id === id ? updatedSection : section,
        ),
        currentSection:
          state.currentSection?.id === id
            ? updatedSection
            : state.currentSection,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to update section",
        loading: false,
      });
    }
  },

  patchSection: async (
    id: number | string,
    sectionData: Partial<SectionData>,
  ) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(SectionApi.patchSection(id), sectionData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedSection = res.data.data || res.data;

      set((state) => ({
        sections: state.sections.map((section) =>
          section.id === id ? updatedSection : section,
        ),
        currentSection:
          state.currentSection?.id === id
            ? updatedSection
            : state.currentSection,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || "Failed to patch section",
        loading: false,
      });
    }
  },

  deleteSection: async (id: number | string) => {
    set({ loading: true, error: null });

    try {
      const token = localStorage.getItem("token");
      await axios.delete(SectionApi.deleteSection(id), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      set((state) => ({
        sections: state.sections.filter((section) => section.id !== id),
        currentSection:
          state.currentSection?.id === id ? null : state.currentSection,
        loading: false,
      }));
    } catch (err: any) {
      set({
        error:
          err.response?.data?.detail ||
          err.response?.data?.message ||
          "Failed to delete section",
        loading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

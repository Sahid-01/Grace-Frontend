const BASE_URL = import.meta.env.VITE_API_URL;

export const SectionResultsApi = {
  fetchSectionResults: `${BASE_URL}section-results/`,
  createSectionResult: `${BASE_URL}section-results/`,
  getSectionResult: (id: number | string) =>
    `${BASE_URL}section-results/${id}/`,
  updateSectionResult: (id: number | string) =>
    `${BASE_URL}section-results/${id}/`,
  patchSectionResult: (id: number | string) =>
    `${BASE_URL}section-results/${id}/`,
  deleteSectionResult: (id: number | string) =>
    `${BASE_URL}section-results/${id}/`,
};

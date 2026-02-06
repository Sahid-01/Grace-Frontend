const BASE_URL = import.meta.env.VITE_API_URL;

export const TestSectionsApi = {
  fetchTestSections: `${BASE_URL}test-sections/`,
  createTestSection: `${BASE_URL}test-sections/`,
  getTestSection: (id: number | string) => `${BASE_URL}test-sections/${id}/`,
  updateTestSection: (id: number | string) => `${BASE_URL}test-sections/${id}/`,
  patchTestSection: (id: number | string) => `${BASE_URL}test-sections/${id}/`,
  deleteTestSection: (id: number | string) => `${BASE_URL}test-sections/${id}/`,
  getTestSectionQuestions: (id: number | string) =>
    `${BASE_URL}test-sections/${id}/questions/`,
};

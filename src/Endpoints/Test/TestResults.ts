const BASE_URL = import.meta.env.VITE_API_URL;

export const TestResultsApi = {
  fetchTestResults: `${BASE_URL}test-results/`,
  createTestResult: `${BASE_URL}test-results/`,
  getTestResult: (id: number | string) => `${BASE_URL}test-results/${id}/`,
  updateTestResult: (id: number | string) => `${BASE_URL}test-results/${id}/`,
  patchTestResult: (id: number | string) => `${BASE_URL}test-results/${id}/`,
  deleteTestResult: (id: number | string) => `${BASE_URL}test-results/${id}/`,
  publishTestResult: (id: number | string) =>
    `${BASE_URL}test-results/${id}/publish/`,
  getTestResultSectionResults: (id: number | string) =>
    `${BASE_URL}test-results/${id}/section_results/`,
};

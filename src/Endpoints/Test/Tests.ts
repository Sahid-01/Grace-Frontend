const BASE_URL = import.meta.env.VITE_API_URL;

export const TestsApi = {
  fetchTests: `${BASE_URL}tests/`,
  createTest: `${BASE_URL}tests/`,
  getTest: (id: number | string) => `${BASE_URL}tests/${id}/`,
  updateTest: (id: number | string) => `${BASE_URL}tests/${id}/`,
  patchTest: (id: number | string) => `${BASE_URL}tests/${id}/`,
  deleteTest: (id: number | string) => `${BASE_URL}tests/${id}/`,
  getTestSections: (id: number | string) => `${BASE_URL}tests/${id}/sections/`,
};

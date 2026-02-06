const BASE_URL = import.meta.env.VITE_API_URL;

export const TestAttemptsApi = {
  fetchTestAttempts: `${BASE_URL}test-attempts/`,
  createTestAttempt: `${BASE_URL}test-attempts/`,
  getTestAttempt: (id: number | string) => `${BASE_URL}test-attempts/${id}/`,
  updateTestAttempt: (id: number | string) => `${BASE_URL}test-attempts/${id}/`,
  patchTestAttempt: (id: number | string) => `${BASE_URL}test-attempts/${id}/`,
  deleteTestAttempt: (id: number | string) => `${BASE_URL}test-attempts/${id}/`,
  getTestAttemptAnswers: (id: number | string) =>
    `${BASE_URL}test-attempts/${id}/answers/`,
  completeTestAttempt: (id: number | string) =>
    `${BASE_URL}test-attempts/${id}/complete/`,
};

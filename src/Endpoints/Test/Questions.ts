const BASE_URL = import.meta.env.VITE_API_URL;

export const QuestionsApi = {
  fetchQuestions: `${BASE_URL}questions/`,
  createQuestion: `${BASE_URL}questions/`,
  getQuestion: (id: number | string) => `${BASE_URL}questions/${id}/`,
  updateQuestion: (id: number | string) => `${BASE_URL}questions/${id}/`,
  patchQuestion: (id: number | string) => `${BASE_URL}questions/${id}/`,
  deleteQuestion: (id: number | string) => `${BASE_URL}questions/${id}/`,
  getQuestionOptions: (id: number | string) =>
    `${BASE_URL}questions/${id}/options/`,
};

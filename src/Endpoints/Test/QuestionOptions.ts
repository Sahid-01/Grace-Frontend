const BASE_URL = import.meta.env.VITE_API_URL;

export const QuestionOptionsApi = {
  fetchQuestionOptions: `${BASE_URL}question-options/`,
  createQuestionOption: `${BASE_URL}question-options/`,
  getQuestionOption: (id: number | string) =>
    `${BASE_URL}question-options/${id}/`,
  updateQuestionOption: (id: number | string) =>
    `${BASE_URL}question-options/${id}/`,
  patchQuestionOption: (id: number | string) =>
    `${BASE_URL}question-options/${id}/`,
  deleteQuestionOption: (id: number | string) =>
    `${BASE_URL}question-options/${id}/`,
};

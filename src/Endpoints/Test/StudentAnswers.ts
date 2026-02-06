const BASE_URL = import.meta.env.VITE_API_URL;

export const StudentAnswersApi = {
  fetchStudentAnswers: `${BASE_URL}student-answers/`,
  createStudentAnswer: `${BASE_URL}student-answers/`,
  getStudentAnswer: (id: number | string) =>
    `${BASE_URL}student-answers/${id}/`,
  updateStudentAnswer: (id: number | string) =>
    `${BASE_URL}student-answers/${id}/`,
  patchStudentAnswer: (id: number | string) =>
    `${BASE_URL}student-answers/${id}/`,
  deleteStudentAnswer: (id: number | string) =>
    `${BASE_URL}student-answers/${id}/`,
};
